---
title: 增量运行E2E测试
tags: project
p: project
categories: project
keywords: 'E2E,Cypress,Incremental running'
date: 2022-08-08 19:51:42
---

<img src="/images/e2e-testing-banner.png" />

<!-- toc -->

## 基础知识

阅读之前你需要知道的知识包括

+ [什么是E2E测试](https://katalon.com/resources-center/blog/end-to-end-e2e-testing)
+ [E2E测试框架Cypress](https://docs.cypress.io/guides/overview/why-cypress)
+ `Git`常用命令
+ `nodejs`基础知识

## 要解决的问题
 随着项目不断的迭代，新的功能在增加，旧的功能也逐渐被更新。这导致E2E测试的体量在不断的增大。
 但是，我们的每次修改不一定会涉及所有的E2E测试。所以，我们是否可以做到只运行本次commit影响的E2E？

## 问题拆分 & 分析

我将问题拆分为下面几个子问题:

1. 如何界定作为对比的基础commit
2. 如何获取这个commit的id
3. 如何获取本次commit和基础commit之间的更新
4. 如何只运行更新的文件并打印运行过程中的日志消息

### 问题分析

+ **对于问题1：**
  + 通常情况：一般我们需要对比的是本次`commit`和当前分支刚被创建出时的`commit`，这是由于，我们的分支一般会从最新的`master`分支获取，而`master`分支中的E2E在大部分情况下，都是已经被验证过的。
  + 和特定commit对比：一些需要和特定`commit`做对比以排查特定更改，引起的bug时。这里特定的`commitID`，需要我们在commit message中加入特定的内容，进行标记。
  + 运行全部的E2E：项目正式更新至线上时，还是期待完整的E2E测试，能为我们带来高的可用性。这里运行全部的E2E，需要我们在commit message中加入特定的内容，进行标记。
+ **对于问题2和3：** 使用`nodejs`的`child_process`模块调度`Git`命令，并使用正则的方式获取需要的内容。
+ **对于问题4：** 使用`nodejs`的`child_process`模块调度`Cypress`命令，并将输出使用`Steam`进行实时输出

## 解决方案

### 获取用于对比的基础commitID

+ **对于通常情况使用**
``` typescript 
const getBranchFirstCommitID = () => {
  return new Promise<string>((res, rej) => {
    // compare with master
    exec('git cherry -v master', (err, data) => {
      if (err) rej(err);
      const dataArr = data.split('\n') as string[];
      const commitContent = dataArr[0].split(' ');

      res(commitContent[1]);
    });
  });
};
```

+ **对于和特定commit对比的情况使用**
``` typescript 
const getCurrentCommit = () => {
  return new Promise<string>((res, rej) =>
    exec(`git log -1`, (err, stdout, stderr) => {
      if (err) {
        rej(stderr);
      }
      res(stdout);
    })
  );
};
const getCompareCommitID = async () => {
  const commitContent = await getCurrentCommit();
  const regx = /\[Compare: (.+?)\]/;
  if (!regx.test(commitContent)) {
    return await getBranchFirstCommitID();
  }
  const resultArray = commitContent.match(regx) as RegExpMatchArray;
  return resultArray[1];
};
```
这里如果运行`getCompareCommitID`后，得到返回值为`'ALL'`的时候，就会运行所有的E2E测试了

### 获取两个Commit之间的更新
**这里我们约定，所有的E2E文件的路径中都会携带`cypress`这个字符**
``` typescript

const getDiffFlies = (baseCommitID: string, commitID: string) => {
  return new Promise<string>((res, rej) =>
    exec(`git diff --name-only ${baseCommitID} ${commitID}`, (err, stdout, stderr) => {
      if (err) {
        rej(stderr);
      }
      res(stdout);
    })
  );
};

const getCommitID = (index: number) => {
  return new Promise<string>((res, rej) =>
    exec(`git show HEAD~${index} --pretty=format:"%h" --no-patch`, (err, stdout) => {
      if (err) {
        rej(err);
      }
      res(stdout);
    })
  );
};

//一些特殊的项目结构下，项目中可能存在多个子系统，所以这里需要匹配特定的路径
const getProjectDiffFiles = async () => {
  try {
    const compareCommitID = await getCompareCommitID();
    const currentCommitID = await getCommitID(0);
    if (compareCommitID === 'ALL') {
      // it will run all tests
      return [];
    }

    const diffFiles = (await getDiffFlies(currentCommitID, compareCommitID)).split('\n');
    const currentProjectDiffFile = diffFiles
      .filter((file) => {
        const {dir} = parse(file);
        const currentDirArr = __dirname.split(sep);
        const currentDir = currentDirArr[currentDirArr.length - 2] as string;
        if (dir.includes(currentDir) && dir.includes('cypress')) {
          return true;
        }
        return false;
      })
      .map((file) => {
        return join(...file.split(sep).slice(2)) as string;
      });
    return currentProjectDiffFile;
  } catch (error) {
    console.log(error); // eslint-disable-line
    throw new Error('get commit id is fail');
  }
};

```

### 只运行更新的文件并打印运行过程中的日志消息

nodejs的child_process模块提供了多种方式运行命令，一般情况下使用exec，但由于exec的输出将会在命令完全运行后才输出，并且一般的CI中，都会设置每一步的响应时间。如果使用exec，有可能会由于E2E时间过长，导致超时。
所以，这里我使用spawn，它将会实时的输出命令的运行日志。

``` typescript
const testRunner = (specPath: string[]) => {
  console.log('It will run test', specPath.join(',')); // eslint-disable-line
  const runner = spawn('cypress', ['run', '--headless', '--spec', specPath.join(',')]);
  runner.stderr.on('data', (data) => {
    if (data) console.log(data.toString()); // eslint-disable-line
  });
  runner.stdout.on('data', (data) => {
    console.log(data.toString()); // eslint-disable-line
  });
};

const main = async () => {
  const testPath = await getProjectDiffFiles();
  testRunner(testPath);
};
```

至此就完成了增量的运行E2E测试。

