---
title: 从CRA将react项目迁移成微前端项目-1
tags: project
p: project
categories: project
keywords: '微前端, CRA 微前端, react 微前端, react monorepo 微前端, micro-front'
date: 2023-01-11 21:53:18
---
# 从CRA将react项目迁移成微前端项目 —— 目录结构的确定和构建方式的更改

<!-- toc -->

## 基础知识

阅读之前你需要知道的知识包括
+ [什么是monorepo](https://en.wikipedia.org/wiki/Monorepo )
+ [什么是pnpm](https://pnpm.io/)
+ [什么是webpack](https://webpack.js.org/)
+ [什么是create-react-app](https://create-react-app.dev/)
+ [使用babel编译TS项目](https://www.typescriptlang.org/docs/handbook/babel-with-typescript.html)
+ [错误的调用react hook](https://reactjs.org/warnings/invalid-hook-call-warning.html)
+ [pnpm workspace](https://pnpm.io/workspaces)

## 为什么需要迁移至微前端？
随着项目不断迭代，原有的项目体积在不断增大。伴随而来的是功能和依赖数量的快速增长。这使得整体项目将越来越难以维护。
并且如果在一个基础旧的功能上进行更新，我们又希望能做到最小代价的开发、测试和构建的话，那么将原有的单体架构拆分成更小的单元，这将是势在必行的。
本篇文章将会以[这个项目](https://github.com/Juggle-Data-View/editor)的迁移为例，讲解整个迁移过程中的思考和实现。

## 拆分前功能分析
<details open >
  <summary style="cursor: pointer;color: red">
  现有目录结构(点击收起/展开)
  </summary>
  <pre>
├── src
│   ├── assets
│   │   ├── fonts
│   │   ├── lib # 需要改动开源包
│   │   │   ├── redux-undo
│   │   │   └── ruler
│   │   └── style
│   │       └── datePicker
│   ├── components
│   │   ├── base 
│   │   ├── common # 系统中的通用组件，包括alert，dialog等
│   │   ├── comps # 系统中的展示数据的组件
│   │   │   ├── codeFragment
│   │   │   ├── commonTitle
│   │   │   ├── datasource
│   │   │   ├── echarts
│   │   │   ├── group
│   │   │   └── _template_
│   │   ├── form # 系统中的表单组件
│   │   └── recursion # 系统中的表单组件生成器
│   │       ├── echarts
│   │       └── widget
│   ├── configurableComponents # 配置化的组件，通用的表单和系统UI主题
│   │   ├── form
│   │   └── theme
│   │       └── overrides
│   ├── helpers # 工具函数，数据解析、后端交互
│   ├── page # 页面结构
│   │   ├── canvas
│   │   └── editor
│   │       ├── Header
│   │       ├── LeftPanel
│   │       ├── RightPanel
│   │       └── User
│   ├── service # 数据模型及处理
│   ├── store # 前端状态管理及本地数据持久化
│   │   ├── DB
│   │   ├── features
│   │   │   └── appSlice
│   │   └── reducers
│   ├── __test__ # 单元测试
│   │   ├── components
│   │   │   └── recursion
│   │   └── utils
│   │       └── MockData
│   ├── @types # 公共类型及包类型overwrite
│   └── utils # 工具函数
  </pre>
</details>
从目录中看，需要抽离的功能包含：

+ 部分工具函数
  + 一部分同时提供给多个，或只提供给抽离后的项目使用。
+ 系统中的展示数据的组件
  + 期待这些组件可以拥有自己的版本控制
  + 并且可以在线热更新
+ 系统中的表单组件生成器
  + 这里的类型需要提供给数据展示组件
  + 抽离后的项目可能使用，比如鉴权模块
+ 部分系统中的通用组件
  + alert这类组件会在所有组件被引用
  + 原有通用组件功能增加，需要关注的问题减少
+ 配置化的组件

## 基于monorepo重建目录结构
### 为什么选择monorepo？
  从以下角度出发：
  + 为拆分后的功能提供独立的版本控制和依赖管理。
  + 使得CI可以按照目录维度进行独立的构建，减少构建的时间。
  + 独立构建后产生功能维度的预发版本，可以更加充分的进行测试。
  + 可以简单为抽离后的项目提供统一版本的公共依赖
  + 可以结合 pnpm workspace 减少的坏境创建的link，对本地全局环境的污染

### 抽离的原则
  这里以系统中Notice组件为例。

  Notice组件，顾名思义，这是用来处理系统中所有弹出式通知的组件。只要用户的操作行为，在业务上被定义为需要告知给用户的，都会使用它对消息内容进行展示。它被系统大部分功能依赖，例如现有目录中的：
  + 表单组件生成器
  + 数据模型及处理
  + 前端状态管理
  + 部分工具函数

  如果对该组件进行抽离，可以预见的是会产生大量的文件修改和测试部分重写。即使花费如此高昂的代价，也要对这类组件进行抽离，对这种行为，我一般遵循这几个原则：
  1. 该功能需要被其他抽离的组件调用。
  2. 该功能未来可能会产生可预见较为频繁的修改。
  3. 需要提供在线的热更新。

  这里着重说一2和3。

  **2**中提到的 *功能可预见较为频繁的修改* 我们可以从notice组件的迭代得到答案。

  例如，目前系统提供的notice只是提供了单纯的消息展示，并且它的消失时机是几个可选择的常量。如果说后续出现一个消失时机来自不同组件的hook或其他事件的需求。这些碎片化的需求，可能就会使得notice频繁进行发版。

  进行拆分之后，我们不必因为某个小功能，对整体系统重新构建。而只需要构建单个功能。

  同时结合 **3**之后，我们对此类功能，抛弃传统的webpack将所有依赖打包成同一个bundle(这里先不讨论 async import)，无论是使用`script + ESM`还是`cjs + new Function`的模式，我们都能在不进行大规模系统构建的前提下，完成对某个功能更新

### 为每个子项目添加自己的 package.json 和 tsconfig.json
  这是为了让抽离后的项目获得下面的特性：
  + 独立的配置管理，如 alias path
  + 独立的依赖，如A组件依赖了a包，但是系统中其他组件没有依赖
  + 独立的版本控制，这里是指 package.json中的version字段

### 重建后的目录结构
  <details >
    <summary>
      整体项目目录结构
    </summary>
    <pre>
.
├── common # 通用组件
│   ├── codeEditor
│   ├── dynamicImport
│   ├── notice
│   ├── recursion
│   └── theme
├── core # 项目主入口
│   ├── config
│   ├── public
│   ├── scripts
│   └── src
├── dataComp # 需要热更新和运行时存在多版本的组件
│   ├── codeFragment
│   ├── commonTitle
│   ├── datasource
│   ├── echarts
│   └── group
└── workspace
    └── devServer # 本地开发命令集
    </pre>
  </details>

  <details>
    <summary>
    common下项目的一般结构
    </summary>
    <pre>
├── package.json
├── pnpm-lock.yaml
├── README.md
├── src
│   ├── index.tsx
│   └── lib.d.ts
└── tsconfig.json    
    </pre>
  </details>

  <details>
    <summary>
    dataComp下项目的一般结构
    </summary>
    <pre>
├── package.json
├── pnpm-lock.yaml
├── src
├── tsconfig.json
└── webpack.config.js # 可能用到的独特的配置，将会被merge到运行的webpackconfig中
    </pre>
  </details>

## 如何构建抽离后的项目
当目录重构后，我们需要对原有的构建流程进行改造。由于项目原本是通过`create-react-app`这个命令创建的，但是后续的修改，不可避免的会对webpack的配置产生大量的修改，所以第一步我们需要运行 `eject`命令，使得我们可以续改项目的构建配置。
### 构建模式的选择 —— 单独打包 or 统一打包
  运行eject后，我们需要确定对于抽离后的项目，是选择每个项目都配置单独的构建流程，还是使用一个通用的构建方式。

  这里出于下面点考虑，我选择了使用通用构建方式：
  + 开发成本低，不必为每个抽离后的项目，开发单独的webpack配置
  + 原本是从单体项目中抽离的，所以构建流程大体一致
  + 更容易控制依赖的版本

  同时，我将 `/core`目录称之为**主项目**，它将提供所有项目的构建配置。

### 在主项目中引用抽离的项目
  + dev环境的package(重建后目录中`common`部分)：使用`pnpm link`创建抽离项目的软连接并引入
  + dev环境的component(重建后目录中`dataComp`部分)：调用主项目的webpack进行构建后，通过本地的dev服务发送静态资源文件(bundle.js)，在主项目中使用 `new Function` 的方式引入
  + prod环境的package：在主项目中运行 `pnpm install`, 以module的方式引入。
  + prod环境的component: CI中在每个项目目录中运行构建命令，通过nginx的location，以目录名称为路由地址，提供静态资源文件(bundle.js)，在主项目中使用 `new Function` 的方式引入

### 如何在dev环境维持抽离后的module局部热更新
  确定构建模式后，为了提供良好的开发体验。我们仍然期望，抽离后的代码在开发环境出现更新时，项目仍能提供局部热更新的能力。

  为了实现这个需求，我们需要：
  1. 扩展主项目webpack的构建范围。
  2. 使用`link`命令，创建一个基于软连接的本地依赖。

  实现**1**，需要完成向webpack添加：
  ```javascript

  /**
  * @returns {string[]}
  */
  const resolveAppsRoot = () => {
    const commonPath = path.resolve('../common');
    const deps = fs.readdirSync(path.resolve('../common'));
    return deps.map((pathVal) => {
      return path.join(commonPath, pathVal);
    });
  };

  /**
  *
  * @param {string[]} mainModulesPath
  * @returns {string[]}
  */
  const getValidCompilerModulesPath = (mainModulesPath) => {
    const appsRoot = resolveAppsRoot();
    return mainModulesPath.concat(
      appsRoot.reduce((curr, rootPath) => {
        return [...curr, path.join(rootPath, 'src'), path.join(rootPath, 'node_modules')];
      }, [])
    );
  };

  /**
  * @param {string} appSrc
  * @returns {string[]}
  */
  const resolveAppsSrc = (appSrc) => {
    const commonPath = path.resolve('../common');
    const deps = fs.readdirSync(path.resolve('../common'));
    return [
      appSrc,
      ...deps.map((pathVal) => {
        return path.join(commonPath, pathVal, 'src');
      }),
    ];
  };

  // webpack config modify

  {
    //...
    resolve: {
        //...
        modules: getValidCompilerModulesPath(
          ['node_modules', paths.appNodeModules].concat(modules.additionalModulePaths || [])
        ),
        //...
    },
    //...
    module:{
      //...
      rules: [
        //...
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          include: isEnvDevelopment ? resolveAppsSrc(pathsappSrc) : paths.appSrc,
          loader: require.resolve('babel-loader'),
          //...
        }
      ],
      //...
    }
    //...
  }
  ```
  这里解释一下这些改动的意义：
  + `module.rules` 的修改, 扩展了webpack的构建范围，可以使用主项目中的babel（支持typescript），编译抽离后的项目。
  + `resolve.modules` 的修改，是让主项目webpack可以解析抽离后项目的独立依赖。
  + `resolveAppsSrc` 函数处理抽离后项目的需要编译的路径
  + `getValidCompilerModulesPath` 数处理抽离后项目的依赖需要编译的路径


#### **控制所有项目中react的版本&单一实例控制**
  **step1:** 在项目的根目录下创建`pnpm-workspace.yaml` 和 `package.json`。

  **step2:** 然后在根目录运行如下命令：
  ```shell
  pnpm add -w react react-dom
  ```
  **step3:** 在抽离后的项目(如`common/recursion`)目录中运行

  ```shell
  pnpm add --save-peer react react-dom
  ```
  **step4:** webpack的修改如下
  ```javascript
  {
    //...
    resolve: {
      //...
      alias: {
        //...
        react: path.resolve('../node_modules/react'),
        'react-dom': path.resolve('../node_modules/react-dom'),
        //...
      },
    }
  }
  ```

  逐条解释它们的作用
  
  + step1: 提供一个 pnpm 的 workspace。使得抽离后的项目中的依赖可以从工作区共享。减少抽离后的项目的整体体积。
  + step2:将react添加到工作区中
  + step3:将抽离后项目的react依赖，从生产环境构建时剔除
  + step4:为抽离后的项目提供了单一实例的react和react-dom，这在固定了react版本的同时，解决了react hook要求项目只能包含一个react实例的问题。但这里没有完全解决，context共享问题，在多个项目共享一个带有`useContext`的依赖时，会出现`undefined`的问题

#### **多项目context共享** 
  以formik为例，需要修改主项目的webpack
  ```javascript
  {
    //...
    resolve: {
      //...
      alias: {
        //...
        formik: path.resolve('../node_modules/formik'),
        //...
      },
    }
  }
  ```
  一些使用新版 CRA 的项目还需要修改`ModuleScopePlugin`，来放开对于依赖范围的检测

### 提供alias功能
  我们在开发中，经常会遇到引用一些公共函数的需求，但是，如果引用的层级太深，难免会出现形如 `import moduleFunc from '../../../../../utils/getData'`的路径。这样的路径，可读性差，并且如果出现整体目录迁移并且引用该功能的文件非常，会使得这些文件都出现修改。

  所以一般我们都会使用形如`import moduleFunc from @utils/getData;`的方式进行优化。

  但如果在抽离后的项目使用这样的特性，需要对主项目的webpack再做一些更改，这是因为由于构建命令的执行目录在主项目下，它们的相对路径，并没有对应到抽离后的项目目录。需要对webpack做出如下修改：
  ``` javascript
  //webpack config
   {
    //...
    resolve: {
      //...
      alias: {
        //...
        ...(getValidCompilerPaths(modules.webpackAliases) || {}),
        //...
      },
    }
  }
    /**
    * 获取alias真实的编译路径
    * @param {Record<string,string>} alias
    * @returns {Record<string,string>}
    */
    const getValidCompilerPaths = (mainAlias) => {
      const appsRoot = resolveAppsRoot();
      return appsRoot.reduce((curr, next) => {
        const alias = handleTSAlias(next);
        return {
          ...alias,
          ...curr,
        };
      }, mainAlias);
    };
  /**
   * 
    * @typedef {object} Options
    * @property {string} options.baseUrl
    * @property {{
    *    [key: string]: string[]
    *  }} options.paths
    * 获取webpack使用的alias的绝对路径
    *
    * @param {Options} options
    * @param {{
    *  rootPath: string;
    * }} extension
    */
    function getWebpackAliases(options = {}, extension = {}) {
      const { baseUrl, paths: aliasPath } = options;
      const { rootPath } = extension;

      const appPath = rootPath ? rootPath : paths.appPath;
      const appSrc = rootPath ? path.join(rootPath, baseUrl) : paths.appSrc;

      if (!baseUrl) {
        return {};
      }

      const baseUrlResolved = path.resolve(appPath, baseUrl);

      if (path.relative(appPath, baseUrlResolved) === '') {
        return {
          src: appSrc,
        };
      }
      if (isEmpty(aliasPath)) {
        return {};
      }
      const aliasPathKeys = Object.keys(aliasPath);
      const result = aliasPathKeys.reduce((prev, curr) => {
        const aliasPathArr = aliasPath[curr];
        return {
          ...prev,
          [curr.replace('/*', '')]: path.resolve(appSrc, aliasPathArr[0].replace('/*', '')),
        };
      }, {});
      console.log(result);
      return result;
    }

    /**
    * 获取对应项目的tsconfig
    * @param {string} rootPath
    * @returns {Record<string, string[]>}
    */
    const getTSOption = (rootPath) => {
      const appTsConfig = path.join(rootPath, 'tsconfig.json');
      const hasTsConfig = fs.existsSync(appTsConfig);
      if (!hasTsConfig) {
        throw new Error('sub-project tsconfig is not exist');
      }
      const ts = require(resolve.sync('typescript', {
        basedir: paths.appNodeModules,
      }));
      const config = ts.readConfigFile(appTsConfig, ts.sys.readFile).config;
      return config.compilerOptions || {};
    };

    /**
    * 处理TS中声明的alias，使得tsconfig中的alias能与webpack对应上
    * @param {string} rootPath
    * @returns {string}
    */
    const handleTSAlias = (rootPath) => {
      return getWebpackAliases(getTSOption(rootPath), { rootPath });
    };
  ``` 
### 整体项目typecheck
  在上一个小节中，完成对alias的解析，但是，会出现ts类型错误，如：`无法找到模块@utils`。这是因为上面我们只解决了，webpack的编译打包流程，但类型检查仍没有提供抽离后的项目和其目录的对应关系。

  这里我们需要将类型检测的范围扩展到整体项目范围，并提供对应的文件路径关系
  ```javascript
  // webpack config 
  {
    //...
    plugins: {
      //...
      new ForkTsCheckerWebpackPlugin({
        //...
        typescript: {
          //...
          configOverwrite: {
          //...
            compilerOptions: {
              references: getTypeCheckPaths(),
            }
          //...
          }
          //...
        }
        //...
      }),
    }
  }

  const getTypeCheckPaths = () => {
    const appsRoot = resolveAppsRoot();
    const formatPaths = (aliasPath, appRoot) => {
      return Object.keys(aliasPath).reduce((curr, next) => {
        const item = aliasPath[next];
        return {
          ...curr,
          [next]: path.join(appRoot, item[0]),
        };
      }, {});
    };

    const result = appsRoot.reduce((curr, next) => {
      //getTSOption的实现参考上面
      const { paths: aliasPath } = getTSOption(next);
      if (isEmpty(aliasPath)) {
        return curr;
      } else {
        return { ...curr, ...formatPaths(aliasPath, next) };
      }
    }, {});
    return result;
  };
  ``` 
## 后续计划
### dev环境提供构建特定modules的命令
  上面的一系列改动，解决了抽离后整体项目的构建问题，但目前的构建方式仍然是全量进行构建，预期是通过一个可交互的command，让用户可以选择构建那些抽离后的项目。没被选中的，使用`pnpm add <package-names>`，从公共仓库安装到主项目中。
### 实现部分组件的在线热更新
  `dataComp`中的项目均需要提供在线热更新。

  dev环境将提供一个dev server提供编译后的`bundle.js`。
  
  prod环境将使用nginx为不同项目的编译产物提供静态服务。

  主项目都将使用 `fetch + new Fucntion`的方式引入此类组件。
### 允许组件在运行时同时存在多版本 
  `dataComp`中的项目对于不同的用户，可能同时需要存在不同的版本。这需要在它的URL信息中加入版本信息，用来加载不同版本的编译产物。
