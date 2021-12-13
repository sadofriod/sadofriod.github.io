---
title: Hexo的一些增强--目录以及RSS订阅
tags: interesting
p: interesting
categories: interesting
date: 2021-12-13 15:07:14
---
<!-- toc -->

## 阅读之前

### 你需要知道的知识包括
+ 使用npm/yarn管理项目的依赖
+ Hexo的基本使用

### 前置的一些环境
+ Node.js & NPM

## 使你的Hexo支持目录

进入Hexo项目的根目录中，使用npm/yarn添加依赖
``` shell
  npm install hexo-toc #当你使用npm时
  # or
  yarn add hexo-toc #当你使用yarn时
```

之后在根目录中的`_config.yml`添加:

``` yml
#目录
toc:
  maxDepth: 3 #目录层级
  class: toc
  slugify: transliteration
  decodeEntities: false
  anchor:
    position: after
    symbol: '#'
    style: header-anchor #基础样式
```


```

## 为你的博客生成RSS源

进入Hexo项目的根目录中，使用npm/yarn添加依赖
``` shell
  npm install hexo-generator-feed #当你使用npm时
  # or
  yarn add hexo-generator-feed #当你使用yarn时
```

之后在根目录中的`_config.yml`添加:

``` yml
#目录
toc:
  maxDepth: 3 #目录层级
  class: toc
  slugify: transliteration
  decodeEntities: false
  anchor:
    position: after
    symbol: '#'
    style: header-anchor #基础样式
```

如果已经构建过项目，请先进入项目根目录下运行，清除缓存
``` shell
  hexo clean
```

``` yml
# RSS support
feed:
  enable: true
  type:
    rss2 # 与path关联
  path:
    rss2.xml # 与type关联
  limit: 140
  hub:
  content: true
  content_limit: 140
  content_limit_delim: ' '
  order_by: -date
  icon: https://avatars.githubusercontent.com/u/23006024?v=4 #RSS 展示的图标
  autodiscovery: true
```

如果已经构建过项目，请先进入项目根目录下运行，清除缓存
``` shell
  hexo clean
```

## 尝试构建
然后进行正常的hexo的生成和测试
``` shell
  hexo g & hexo s