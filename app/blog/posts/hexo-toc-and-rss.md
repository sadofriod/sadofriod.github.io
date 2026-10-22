---
title: Hexo table of contents and RSS
tags: interesting
p: interesting
categories: interesting
date: 2021-12-13 15:07:14
keywords: 'hexo table of contents,hexo toc,hexo rss,hexo reading progress,hexo theme enhancement'
lang: en
translationKey: Hexo的一些增强-目录以及RSS订阅
---


## Before you read

### What you need to know
+ Managing project dependencies with npm/yarn
+ Basic usage of Hexo

### Prerequisites
+ Node.js & NPM

## Making your Hexo blog support a table of contents

Go to the root directory of your Hexo project and add the dependency with npm/yarn
``` shell
  npm install hexo-toc #when you use npm
  # or
  yarn add hexo-toc #when you use yarn
```

Then add the following to `_config.yml` in the root directory:

``` yml
#table of contents
toc:
  maxDepth: 3 #heading depth
  class: toc
  slugify: transliteration
  decodeEntities: false
  anchor:
    position: after
    symbol: '#'
    style: header-anchor #base style
```



## Generating an RSS feed for your blog

Go to the root directory of your Hexo project and add the dependency with npm/yarn
``` shell
  npm install hexo-generator-feed #when you use npm
  # or
  yarn add hexo-generator-feed #when you use yarn
```

Then add the following to `_config.yml` in the root directory:

``` yml
#table of contents
toc:
  maxDepth: 3 #heading depth
  class: toc
  slugify: transliteration
  decodeEntities: false
  anchor:
    position: after
    symbol: '#'
    style: header-anchor #base style
```

If you have already built the project, first go to the project root directory and clear the cache
``` shell
  hexo clean
```

``` yml
# RSS support
feed:
  enable: true
  type:
    rss2 # tied to path
  path:
    rss2.xml # tied to type
  limit: 140
  hub:
  content: true
  content_limit: 140
  content_limit_delim: ' '
  order_by: -date
  icon: https://avatars.githubusercontent.com/u/23006024?v=4 #the icon shown in the RSS feed
  autodiscovery: true
```

If you have already built the project, first go to the project root directory and clear the cache
``` shell
  hexo clean
```

## Trying the build
Then run the normal Hexo generate and test
``` shell
  hexo g & hexo s
