---
title: 'Migrating a CRA App to a Micro Frontend (Part 1): Architecture and Setup'
tags: project
p: project
categories: project
keywords: 'CRA micro frontend,micro frontend migration,qiankun,module federation,legacy project refactor,micro frontend architecture,micro frontend react,migrating create-react-app to micro frontend,pnpm monorepo webpack'
date: 2023-01-11 21:53:18
lang: en
translationKey: 从CRA将react项目迁移成微前端项目-1
excerpt: 'A step-by-step account of turning a create-react-app monolith into a pnpm monorepo of micro frontend packages: how to decide what to extract, how to rewire webpack to compile across projects, keep a single React instance, share context, resolve TS aliases, and type-check the whole workspace.'
description: 'How to migrate a create-react-app React project into a micro frontend architecture: analysing what to extract, rebuilding the repo as a pnpm monorepo, ejecting CRA, extending webpack build scope and module resolution across packages, pinning a single React instance with peer dependencies, sharing context across projects, resolving tsconfig path aliases, and running type checks over the whole workspace.'
---
# Migrating a CRA React Project to a Micro Frontend — Determining the Directory Structure and Changing the Build Approach



## Prerequisites

What you need to know before reading:

+ [What is a monorepo](https://en.wikipedia.org/wiki/Monorepo )
+ [What is pnpm](https://pnpm.io/)
+ [What is webpack](https://webpack.js.org/)
+ [What is create-react-app](https://create-react-app.dev/)
+ [Compiling a TypeScript project with babel](https://www.typescriptlang.org/docs/handbook/babel-with-typescript.html)
+ [Invalid hook call in React](https://reactjs.org/warnings/invalid-hook-call-warning.html)
+ [pnpm workspace](https://pnpm.io/workspaces)

## Why migrate to a micro frontend?
As the project keeps iterating, the existing project keeps growing in size. Along with that comes rapid growth in the number of features and dependencies. This makes the project as a whole increasingly hard to maintain.
And if we want to update on top of an existing legacy feature while keeping development, testing and building as cheap as possible, then splitting the original monolithic architecture into smaller units becomes unavoidable.
This article uses the migration of [this project](https://github.com/Juggle-Data-View/editor) as an example to explain the thinking and the implementation behind the whole migration.

## Feature analysis before splitting
<details open >
  <summary style="cursor: pointer;color: red">
  Existing directory structure (click to collapse/expand)
  </summary>
  <pre>
├── src
│   ├── assets
│   │   ├── fonts
│   │   ├── lib # open-source packages that need modification
│   │   │   ├── redux-undo
│   │   │   └── ruler
│   │   └── style
│   │       └── datePicker
│   ├── components
│   │   ├── base 
│   │   ├── common # shared components in the system, including alert, dialog, etc.
│   │   ├── comps # components in the system that render data
│   │   │   ├── codeFragment
│   │   │   ├── commonTitle
│   │   │   ├── datasource
│   │   │   ├── echarts
│   │   │   ├── group
│   │   │   └── _template_
│   │   ├── form # form components in the system
│   │   └── recursion # form component generator in the system
│   │       ├── echarts
│   │       └── widget
│   ├── configurableComponents # configurable components, shared forms and system UI theme
│   │   ├── form
│   │   └── theme
│   │       └── overrides
│   ├── helpers # utility functions, data parsing, backend interaction
│   ├── page # page structure
│   │   ├── canvas
│   │   └── editor
│   │       ├── Header
│   │       ├── LeftPanel
│   │       ├── RightPanel
│   │       └── User
│   ├── service # data models and processing
│   ├── store # frontend state management and local data persistence
│   │   ├── DB
│   │   ├── features
│   │   │   └── appSlice
│   │   └── reducers
│   ├── __test__ # unit tests
│   │   ├── components
│   │   │   └── recursion
│   │   └── utils
│   │       └── MockData
│   ├── @types # shared types and package type overwrites
│   └── utils # utility functions
  </pre>
</details>
Judging from the directory, the features that need to be extracted include:

+ Some utility functions
  + Some of them are shared by multiple consumers, or only used by the extracted projects.
+ The components in the system that render data
  + We want these components to have their own version control
  + And to be hot-updatable online
+ The form component generator in the system
  + The types here need to be provided to the data-rendering components
  + The extracted projects may use it too, for example the auth module
+ Some of the shared components in the system
  + Components like alert are referenced by every component
  + As the existing shared components gain features, the number of things to watch out for decreases
+ The configurable components

## Rebuilding the directory structure based on a monorepo
### Why choose a monorepo?
  For the following reasons:

+ Provide independent version control and dependency management for each extracted feature.
+ Let CI build independently along directory lines, reducing build time.
+ Independent builds produce per-feature pre-release versions, which can be tested more thoroughly.
+ Makes it easy to give the extracted projects a single shared version of common dependencies
+ Combined with pnpm workspace, it reduces the links created per environment and the pollution of the local global environment

### The principle behind extraction
  Take the Notice component in the system as an example.

  The Notice component, as the name suggests, handles all pop-up notifications in the system. Any user action that the business defines as something the user needs to be told about uses it to display the message. It is depended on by most of the system's features, for example in the existing directory:

+ the form component generator
+ data models and processing
+ frontend state management
+ some utility functions

  If we extract this component, it is foreseeable that it will cause a large number of file changes and partial test rewrites. Even at such a high cost, I still extract components like this, and for such work I generally follow these principles:

1. The feature needs to be called by other extracted components.
2. The feature is likely to change fairly frequently in a foreseeable way.
3. It needs to support hot updates online.

  Here I will focus on 2 and 3.

  The *feature is likely to change fairly frequently* mentioned in **2** can be answered by looking at the Notice component's iterations.

  For example, the notice the system currently provides only does plain message display, and its dismissal timing is one of a few selectable constants. If a requirement later appears where the dismissal timing comes from a hook in a different component or from some other event, these fragmented requirements would probably make notice ship releases frequently.

  After splitting, we don't need to rebuild the whole system for one small feature. We only build the single feature.

  And combined with **3**, for features like this we abandon the traditional webpack approach of bundling all dependencies into one bundle (leaving aside async import for now). Whether we use `script + ESM` or the `cjs + new Function` pattern, we can update a single feature without a large-scale system build.

### Give each sub-project its own package.json and tsconfig.json
  This is so the extracted projects get the following properties:

+ independent configuration management, such as alias paths
+ independent dependencies, for example component A depends on package a while other components in the system do not
+ independent version control, meaning the version field in package.json

### The rebuilt directory structure
  <details >
    <summary>
      Overall project directory structure
    </summary>
    <pre>
.
├── common # shared components
│   ├── codeEditor
│   ├── dynamicImport
│   ├── notice
│   ├── recursion
│   └── theme
├── core # main project entry
│   ├── config
│   ├── public
│   ├── scripts
│   └── src
├── dataComp # components that need hot updates and multiple versions at runtime
│   ├── codeFragment
│   ├── commonTitle
│   ├── datasource
│   ├── echarts
│   └── group
└── workspace
    └── devServer # local development command set
    </pre>
  </details>

  <details>
    <summary>
    General structure of a project under common
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
    General structure of a project under dataComp
    </summary>
    <pre>
├── package.json
├── pnpm-lock.yaml
├── src
├── tsconfig.json
└── webpack.config.js # distinctive config that may be needed, merged into the running webpack config
    </pre>
  </details>

## How to build the extracted projects
Once the directory has been reorganised, we need to rework the existing build pipeline. The project was originally created with the `create-react-app` command, but subsequent modifications will inevitably bring a large number of changes to the webpack configuration, so the first step is to run the `eject` command so that we can keep modifying the project's build configuration.
### Choosing a build mode — separate builds or a unified build
  After running eject, we need to decide whether to give each extracted project its own build pipeline or to use one common build approach.

  For the following reasons, I chose the common build approach:

+ Low development cost: no need to write a separate webpack config for each extracted project
+ The projects were extracted from a monolith, so the build pipeline is broadly the same
+ Easier to control dependency versions

  At the same time, I call the `/core` directory the **main project**; it provides the build configuration for all projects.

### Referencing the extracted projects from the main project

+ packages in the dev environment (the `common` part of the rebuilt directory): create a symlink to the extracted project with `pnpm link` and import it
+ components in the dev environment (the `dataComp` part of the rebuilt directory): build them with the main project's webpack, serve the static asset file (`bundle.js`) via a local dev server, and import them in the main project using `new Function`
+ packages in the prod environment: run `pnpm install` in the main project and import them as modules.
+ components in the prod environment: CI runs the build command in each project directory, nginx `location` blocks serve the static asset file (`bundle.js`) with the directory name as the route, and the main project imports them using `new Function`

### How to keep local hot reload for the extracted modules in the dev environment
  Once the build mode is settled, for a good developer experience we still want the project to keep partial hot reload when the extracted code changes in the dev environment.

  To achieve this we need to:

1. Extend the main project's webpack build scope.
2. Use the `link` command to create a local dependency based on a symlink.

  To achieve **1**, we need to add the following to webpack:
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
  Here is what these changes mean:

+ The `module.rules` change extends webpack's build scope, so the main project's babel (with TypeScript support) can compile the extracted projects.
+ The `resolve.modules` change lets the main project's webpack resolve the extracted projects' own dependencies.
+ The `resolveAppsSrc` function handles the paths of the extracted projects that need compiling
+ The `getValidCompilerModulesPath` function handles the paths of the extracted projects' dependencies that need compiling


#### **Controlling the react version across all projects & single-instance control**
  **step1:** Create `pnpm-workspace.yaml` and `package.json` in the project root.

  **step2:** Then run the following command in the root:
  ```shell
  pnpm add -w react react-dom
  ```
  **step3:** In the extracted project (e.g. `common/recursion`) run

  ```shell
  pnpm add --save-peer react react-dom
  ```
  **step4:** modify webpack as follows
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

  Explaining each one in turn
  
+ step1: provides a pnpm workspace, so dependencies of the extracted projects can be shared from the workspace. This reduces the overall size of the extracted projects.
+ step2: adds react to the workspace
+ step3: removes the extracted projects' react dependency from the production build
+ step4: gives the extracted projects a single instance of react and react-dom, which pins the react version while solving the problem that react hooks require the project to contain only one react instance. But this does not fully solve the context sharing problem: when multiple projects share a dependency that uses `useContext`, it will come out as `undefined`

#### **Sharing context across projects** 
  Taking formik as an example, the main project's webpack needs to be modified
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
  Some projects using newer versions of CRA also need to modify `ModuleScopePlugin` to relax the dependency scope check

### Providing the alias feature
  In development we often need to reference common functions, but if the import is too deeply nested we inevitably end up with paths like `import moduleFunc from '../../../../../utils/getData'`. Such paths are hard to read, and if the whole directory is moved and many files reference that feature, all of those files have to change.

  So we usually optimise this with something like `import moduleFunc from @utils/getData;`.

  But if the extracted projects use this feature, the main project's webpack needs further changes. This is because the build command runs in the main project, so their relative paths do not map to the extracted project directories. webpack needs the following changes:
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
    * Get the real compile path for an alias
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
    * @property {Record<string, string[]>} options.paths
    * Get the absolute paths of the aliases used by webpack
    *
    * @param {Options} options
    * @param {Object} extension
    * @property {string} extension.rootPath
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
    * Get the tsconfig of the corresponding project
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
    * Handle the aliases declared in TS so that tsconfig aliases line up with webpack
    * @param {string} rootPath
    * @returns {string}
    */
    const handleTSAlias = (rootPath) => {
      return getWebpackAliases(getTSOption(rootPath), { rootPath });
    };
  ``` 
  
### Type checking the whole project
  In the previous section we finished resolving the aliases, but TS type errors appear, such as: `Cannot find module @utils`. That is because we only solved webpack's compile and bundle pipeline above; type checking still has no mapping between the extracted projects and their directories.

  Here we need to extend the type-checking scope to the whole project and provide the corresponding file path relationships
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
      // see above for the implementation of getTSOption
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

## Follow-up plans
### Provide a command in the dev environment to build specific modules
  The series of changes above solved building the whole project after extraction, but the current build is still a full build. The plan is an interactive command that lets the user choose which extracted projects to build. Those not selected are installed into the main project from the public registry with `pnpm add <package-names>`.

### Implement online hot updates for some components
  Every project in `dataComp` needs to support online hot updates.

  The dev environment will provide a dev server that serves the compiled `bundle.js`.
  
  The prod environment will use nginx to serve the build output of each project as static files.

  The main project will import such components using `fetch + new Function`.

### Allow multiple versions of a component to coexist at runtime 
  Projects in `dataComp` may need different versions to coexist for different users. This requires adding version information to their URL, so that different build outputs can be loaded.
