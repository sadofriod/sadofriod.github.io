---
title: Local hot reload for a React project inside a monorepo
tags: project
p: project
categories: project
keywords: 'monorepo hot reload, pnpm monorepo, HMR broken, React shared instance, micro-frontend local development, monorepo developer experience, monorepo react hot reload'
date: 2022-08-07T23:00:31
lang: en
translationKey: monorepo结构下启动react项目局部热更新
---

<img src="/images/monorepo-react-banner.jpeg" />



## Prerequisites

What you need to know before reading:

+ [What is a monorepo](https://en.wikipedia.org/wiki/Monorepo )
+ [Some use cases for monorepos](https://semaphoreci.com/blog/what-is-monorepo#monorepo-culture)
+ Writing webpack configuration
+ [What is pnpm](https://pnpm.io/)

## The problems
  1. When developing multiple sub-projects separately, how do you pin the react version?
  2. How do you ensure that when the main project loads a sub-project as a component, both share the same react instance?
  3. During development, how do you handle sub-systems that depend on each other?
  3. When react & react-dom are loaded as externals, hot-reload stops working

## Causes & analysis
+ Why problem [1] arises: with a monorepo structure, we want all sub-systems and the main system (the system's entry point) to use the same react version, so the core dependency of the whole system stays under control and we avoid extra bugs from multi-version compatibility.
+ Why problem [2] arises:
  + hooks require both sides to use the same react instance
  + context also depends on the same react instance
+ Why problem [3] arises: once we satisfy problems [1] and [2], react and react-dom can no longer be bundled into a single bundle, so at the webpack level we need to use `external` to exclude react. At the same time, the mainstream plugin for handling react hot reload, [react-refresh-webpack-plugin](https://github.com/pmmmwh/react-refresh-webpack-plugin), imposes a strict ordering requirement on an externally loaded react core, which breaks hot reload.

## How to solve the problems?

### When developing multiple sub-projects separately, how to pin the react version, and how to ensure the main project and a sub-project loaded as a component share the same react instance
We want the react dependency of every project in this system to point at the same react core file, so once all projects in the system are built, the react version is fixed. We can achieve this by modifying `webpack.config.js` and the project's HTML template:
For `webpack.config.js`, add:
``` javascript
  {
    //...
    external: ['react','react-dom']
    //...
  }
```
For the HTML template (the exact syntax here depends on the template parser you use):

```HTML5
  <script data-tn="react-bundle" type="text/javascript" src="REACT_BUNDLE_URL"></script>
  <script data-tn="react-dom-bundle" type="text/javascript" src="REACT_DOM_BUNDLE_URL"></script>
```

Here `reactBundlePath` and `reactDomBundlePath` are the results of compiling react separately; they correspond to two js files.

At this point react core is externalized. Every sub-project, when developed on its own, can modify its own HTML template to use the shared react core, and the main system and sub-systems always use the same react instance.

### During development, how to handle sub-systems that depend on each other
Before webpack 5, you could add this to webpack:
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
Then you could easily use the functionality exposed by another sub-project via `import * as MouduleName from 'module_name'`.

### When react & react-dom are loaded as externals, hot-reload breaks
Because [react-refresh-webpack-plugin](https://github.com/pmmmwh/react-refresh-webpack-plugin) imposes a strict ordering requirement on an externally loaded react core, we need to change the project's build output from a single entry to multiple entries, and control their load order in the HTML template.

For `webpack.config.js`, change:
``` javascript
  {
    //...
     entry: isDevelopment
    ? {
        whm: 'webpack-hot-middleware/client?quiet=true&reload=true&path=/<default>/<route>/__webpack_hmr&timeout=2000', //required when using webpack-hot-middleware as the hot reload service
        reactRefreshEntry: '@pmmmwh/react-refresh-webpack-plugin/client/ReactRefreshEntry.js', //makes react perform partial updates
        main: clientEntry, //the project's own entry file
      }
    : clientEntry,//the project's own entry file
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

For the HTML template (the exact syntax here depends on the template parser you use):

```HTML5
    <!-- Development entry points -->
    <script type="text/javascript" src="BUNDLE_BASE_URL/client.bundle.js"></script>
    <script type="text/javascript" src="BUNDLE_BASE_URL/vendors.client.bundle.js"></script>
    <script type="text/javascript" src="BUNDLE_BASE_URL/whm.client.bundle.js"></script>
    <script type="text/javascript" src="BUNDLE_BASE_URL/reactRefreshEntry.client.bundle.js"></script>
    <script type="text/javascript" src="BUNDLE_BASE_URL/main.client.bundle.js"></script>

    <!-- Production: render one script tag per client bundle manifest entry. -->
    <script type="text/javascript" src="BUNDLE_BASE_URL/CLIENT_BUNDLE_FILE"></script>
```

That completes local hot reload for a React project inside a monorepo.
