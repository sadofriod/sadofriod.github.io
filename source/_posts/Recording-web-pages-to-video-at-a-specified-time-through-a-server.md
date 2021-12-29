---
title: Recording web pages to video at a specified time through a server
tags: project
p: project
categories: project
keywords: auto recorder video, html to video, webpage to video, puppeteer recorder
date: 2021-12-26 14:53:38
---
Recording web pages to video at a specified time through a server
## Why is there such a need?

I recently work in the field of front-end data visualization, and the need for some monitoring of long-running front-end pages comes up. In the past, my solution was to record through some existing platform on my personal PC via browser, or an earlier approach was to record through some screen recording tools.

In such an approach, the following problems were often encountered.

+ **Insufficient resolution to restore**
+ **The recorded log format is difficult to parse**
+ **Need to open the personal computer for a long time**
+ ** What is recorded through the platform is often not a video, but a DOM-Mirror recording. Such logs are difficult to share with others for troubleshooting**
+ **DOM-Mirror recordings for playback lack value for rendering real-time data returned by the backend (because the point in time has been missed, and playback cannot play back the service state of the backend at that time)**
+ **The number of concurrent recordings is limited by the performance of personal computers**
+ **Recorded files are not well managed**

## My goal

So, based on the above needs, we need to achieve the following requirements.

+ **Record at the native resolution required by the web page**
+ **Be able to record on the server side and not on the PC**
+ **The ability to record generic video and log files that can be easily shared with others**
+ **Ability to make concurrent recordings**
+ **Video frame rate should be smooth enough (at least at 4K)**
+ **Provide access to static resources for recorded files**

## Choice of technology stack

+ Base language and framework - js & nodejs
+ For running tasks at specified times -- cron job
+ For opening web pages -- puppeteer
+ For video recording the following options are available
  + Use the browser api `getDisplayMedia` for recording
  + Use puppeteer to take a screenshot by frame, then compress the image with ffmpeg
  + Use xvfb to record the video stream from the virtual desktop directly by encoding it with ffmpeg

+ For recording logs -- puppeteer provides devtools related events
+ For concurrent processing -- introduce weighted calculations
+ For video processing -- ffmpeg

## The specific implementation

### I. Current solution

#### The main problems that this solution circumvents to solve are.

+ The use of `getDisplayMedia` is limited by the browser's protocol. This api is only available when the access protocol is https, and the recording of audio depends on other api.
+ The performance of `getDisplayMedia` has little room for optimization when recording multiple pages concurrently, and the most fatal problem is that the performance overhead of the recording process is borne by the browser. This means that if the page itself is more performance sensitive, it is basically impossible to record the page running properly using this api.
+ puppeteer's frame-by-frame screenshots are limited by chrome-devtools itself, resulting in only 10+ images being cut out a second. In a data visualization scenario, a large amount of real-time data rendering is obviously unacceptable as well.

#### Core Processes
<!-- ![record]](/images/recorder_base_procedure.png) -->
<img src="/images/recorder_base_procedure.png"/>

#### Key points.

1. use node call xvfb, create virtual desktops: open source library `node-xvfb` has some problems, the virtual desktops created, seem to share the same stream buffer, in the case of concurrent recording, there will be a situation of preemption, resulting in accelerated video content, so the need to encapsulate a new node call xvfb

```Typescript
import * as process from 'child_process';
class XvfbMap {
   private xvfb: {
     [key: string]: {
       process: process.ChildProcessWithoutNullStreams;
       display: number;
       execPath?: string;
     };
   } = {};

   setXvfb = (key: string, display: number, process: process.ChildProcessWithoutNullStreams, execPath?: string) => {
     this.xvfb[key] = {
       display,
       process,
       execPath,
     };
   };

   getSpecXvfb = (key: string) => {
     return this.xvfb[key];
   };

   getXvfb = () => this.xvfb;
  }

  const xvfbIns = new XvfbMap();

  /**
  * 检测虚拟桌面是否运行
  * @param num 虚拟桌面窗口编号
  * @param execPath 内存缓冲文件映射路径
  * @returns Promise<boolean>
  */
   const checkoutDisplay = (num: number, execPath?: string) => {
     const path = execPath || '/dev/null';
     return new Promise<boolean>((res, rej) => {
     const xdpyinfo = process.spawn('xdpyinfo', [
       '-display',
       `:${num}>${path}`,
       '2>&1',
       '&&',
       'echo',
       'inUse',
       '||',
       'echo',
       'free',
     ]);
     xdpyinfo.stdout.on('data', (data) => res(data.toString() === 'inUse'));
     xdpyinfo.stderr.on('data', (data) => rej(data.toString()));
     });
   };

  const getRunnableNumber = async (execPath?: string): Promise<number> => {
   const num = Math.floor(62396 * Math.random());
   const isValid = await checkoutDisplay(num, execPath);
   if (isValid) {
     return num;
   } else {
     return getRunnableNumber(execPath);
   }
  };

  export const xvfbStart = async (
   key: string,
   option: { width: number; height: number; depth: 15 | 16 | 24 },
   execPath?: string
  ) => {
   const randomNum = Math.floor(62396 * Math.random());
   const { width, height, depth } = option;
   try {
     const xvfb = process.spawn('Xvfb', [
       `:${randomNum}`,
       '-screen',
       '0',
       `${width}x${height}x${depth}`,
       '-ac',
       '-noreset',
     ]);

     xvfbIns.setXvfb(key, randomNum, xvfb, execPath);
     return randomNum;
   } catch (error) {
     console.log(error);
     return 99;
   }
  };

export const xvfbStop = (key: string) => {
  const xvfb = xvfbIns.getSpecXvfb(key);
  return xvfb.process.kill();
};

export default xvfbIns;

```


2. Load balancing during concurrent server recording. This feature is to solve the problem of high server CPU load when recording video encoding concurrently. So to maximize the number of concurrent recordings, I record the number of tasks being and will be performed by each server, mark this number as the weight of the service, and when a new recording task is created, first check the weight of the current server, then create the recording task on the server with the lowest weight, and lower the weight when the recording is completed and the task is manually terminated.
```typescript
import { CronJob } from 'cron';

interface CacheType {
  [key: string]: CronJob;
}

class CronCache {
  private cache: CacheType = {};
  private cacheCount = 0;
  setCache = (key: string, value: CronJob) => {
    this.cache[key] = value;
    this.cacheCount++;
    return;
  };

  getCache = (key: string) => {
    return this.cache[key];
  };

  deleteCache = (key: string) => {
    if (this.cache[key]) {
      delete this.cache[key];
    }

    this.cacheCount = this.cacheCount > 0 ? this.cacheCount - 1 : 0;
  };

  getCacheCount = () => this.cacheCount;
  getCacheMap = () => this.cache;
}

export default new CronCache();

```

3. When starting puppeteer, you need to provide parameters

   ```typescript
   const browser = await puppeteer.launch({
         headless: false,
         executablePath: '/usr/bin/google-chrome',
         defaultViewport: null,
         args: [
           '--enable-usermedia-screen-capturing',
           '--allow-http-screen-capture',
           '--ignore-certificate-errors',
           '--enable-experimental-web-platform-features',
           '--allow-http-screen-capture',
           '--disable-infobars',
           '--no-sandbox',
           '--disable-setuid-sandbox',//关闭沙箱
           '--start-fullscreen',
           '--display=:' + display,
           '-–disable-dev-shm-usage',
           '-–no-first-run', //没有设置首页。
           '–-single-process', //单进程运行
           '--disable-gpu', //GPU硬件加速
           `--window-size=${width},${height}`,//窗口尺寸
         ],
       });
   ```

   

#### solution performance (in docker)

+ Standard 1k resolution: dual-core CPU 2.3Ghz; 10 concurrent at 4G ram
+ Standard 2k resolution: dual-core CPU 2.3Ghz; 4 concurrent under 4G ram

### II. Tried and tested solutions

#### getDisplayMedia mode

##### Key points

1. The api call causes chrome to pop up an interactive window to choose which specific web page to record. Closing this window requires the following parameters to be enabled when starting puppeteer

   ```typescript
   '--enable-usermedia-screen-capturing',
   `-auto-select-desktop-capture-source=recorder-page`,
   '--allow-http-screen-capture',
   '--ignore-certificate-errors',
   '--enable-experimental-web-platform-features',
   '--allow-http-screen-capture',
   '--disable-infobars',
   '--no-sandbox',
   '--disable-setuid-sandbox',
   ```

2. To execute the recording, you need to inject the function via puppeteer `page.exposeFunction`.

## Q & A

Q: Why do I need to introduce xvfb?

A: In the tried and tested solution, getDisplayMedia requires the runtime environment to provide a desktop environment. In the current solution, it is necessary to push the video stream from xvfb directly into ffmpeg

Q: Why are there certain memory requirements?

A: To provide the minimum running memory for chrome

## Project address

https://github.com/sadofriod/time-recorder