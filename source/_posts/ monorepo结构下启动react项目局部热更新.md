---
title: monorepo结构下启动react项目局部热更新
tags: project
p: project
categories: project
keywords: 'monorepo react, react hot reload, fast refresh, external react'
date: 2022-08-07 23:00:31
---

<img src="/images/monorepo-react-banner.jpeg" />

<!-- toc -->

## 基础知识

阅读之前你需要知道的知识包括

+ [什么是monorepo](https://en.wikipedia.org/wiki/Monorepo )
+ [monorepo的一些应用场景](https://semaphoreci.com/blog/what-is-monorepo#monorepo-culture)
+ webpack的配置的编写
+ [什么是pnpm](https://pnpm.io/)

## 遇到的问题
  1. 多子项目单独开发时，如何确定react版本？
  2. 如何保证主项目加载子项目作为组件时，二者公用同一个react实例？
  3. 开发时，如何处理互相存在依赖子系统？
  3. 外置化加载react&react-dom时，hot-reload失效

## 问题原因&分析
+ 为什么会引入问题[1]：这是因为使用用monorepo这个结构时，我们希望所有的子系统和主系统(系统的入口)，使用同一个react版本，以便系统整体的核心依赖的控制，并且减少多版本兼容带来的额外的bug。
+ 为什么会引入问题[2]：
  + hooks的使用要求二者必须使用的是一个react实例
  + 对于context，它的使用也依赖于同一react实例
+ 为什么会引入问题[3]：当我们同时满足问题[1]和[2]时，react和react-dom将不能被打包到一个bandle包中，所以在webpack层面，我们需要使用external，排除react。与此同时，由于主流的用于处理react热更新的插件，[react-refresh-webpack-plugin](https://github.com/pmmmwh/react-refresh-webpack-plugin)对于外置加载的react core有严格的顺序要求，所以导致了热更新的失效

## 如何解决问题？

### 多子项目单独开发时，如何确定react版本，以及如何保证主项目加载子项目作为组件时，二者公用同一个react实例
我们期待所有这个系统中，所有项目的react依赖都指向同一个react core文件，这样在系统所有项目都构建完成后，react的版本就确定了下来，所以我们可以修改`webpack.config.js`和项目的HTML模版来达到这个目标：
对于`webpack.config.js`增加： 
``` javascript
  {
    //...
    external: ['react','react-dom']
    //...
  }
```
对于HTML模版（这里的具体语法，需要根据具体使用的模版解析器语法来）：

```HTML5
    <script data-tn="react-bundle" type="text/javascript" src="{{reactBundlePath | safe}}"><script>
    <script data-tn="react-dom-bundle" type="text/javascript" src="{{reactDomBundlePath | safe"></script>
```

这里的 `reactBundlePath` 和 `reactDomBundlePath`是react单独编译后的结果，对应的是两个js文件。

至此react core就完成外置化，所有的子项目在单独开发时，都可以修改自己的HTML模版，以使用公共的react core，并且主系统和子系统的react实例始终一直，在

### 开发时，如何处理互相存在依赖子系统
在webpack5之前，可以在webpack中增加：
``` javascript
  {
    //...
    resolve:{
      //...
      alias:{
        '<module_name>': 'project/root/path/provide/modules'
      }
    }
    //...
  }
```
这样就可以轻松的通过 `import * as MouduleName from 'module_name'`的方式使用另一个子项目暴露的功能了。

### 外置化加载react&react-dom时，hot-reload失效
由于[react-refresh-webpack-plugin](https://github.com/pmmmwh/react-refresh-webpack-plugin)对于外置加载的react core有严格的顺序要求，所以我们需要修改项目打包的输出，由原来的单入口，改为多入口。并且在HTML模版中控制它们的加载顺序。

对于`webpack.config.js`需要修改： 
``` javascript
  {
    //...
     entry: isDevelopment
    ? {
        whm: 'webpack-hot-middleware/client?quiet=true&reload=true&path=/<default>/<route>/__webpack_hmr&timeout=2000', //启用webpack-hot-middleware作为热更新服务时需要增加的
        reactRefreshEntry: '@pmmmwh/react-refresh-webpack-plugin/client/ReactRefreshEntry.js', //让react产生局部更新
        main: clientEntry, //项目本身的入口文件
      }
    : clientEntry,//项目本身的入口文件
    //...
     module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.(js|ts|tsx)$/,
              exclude: /node_modules/,
              loader: 'babel-loader',
              options: {
                plugins: ['lodash', isDev && require.resolve('react-refresh/babel')].filter(
                  Boolean
                ),
                presets: [['@babel/env']],
              },
            },
          ],
        },
      ],
    },
    //...
    plugins: defultPlugins.concat(isDevelopment ? [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),

      new ReactRefreshWebpackPlugin({
        overlay: {
          sockIntegration: 'whm',
        },
      }),
    ]:[])
  }
```

对于HTML模版（这里的具体语法，需要根据具体使用的模版解析器语法来）：

```HTML5
    {% if isDev%}
      <script type="text/javascript" src="{{ bundlePath | safe }}/client.bundle.js"></script>
      <script type="text/javascript" src="{{ bundlePath | safe }}/vendors.client.bundle.js"></script>
      <script type="text/javascript" src="{{ bundlePath | safe }}/whm.client.bundle.js"></script>
      <script type="text/javascript" src="{{ bundlePath | safe }}/reactRefreshEntry.client.bundle.js"></script>
    {% endif %}
    <!-- .....  -->
    {% if isDev%}
      <script type="text/javascript" src="{{ bundlePath | safe }}/main.client.bundle.js"></script>
    {% else %}
      {% for url in clientBundle %}
        <script type="text/javascript" src="{{ bundlePath }}/{{ url | safe }}"></script>
      {% endfor %}
    {% endif %}
```

至此就完成在monorepo下，react项目的局部热更新。