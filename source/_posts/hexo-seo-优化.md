---
layout: interesting
title: hexo seo 优化
date: 2021-12-23 13:34:53
tags: interesting
p: interesting
categories: interesting
keywords: hexo seo optimize, hexo seo 优化, seo 优化
---
<!-- toc -->

## 阅读之前

### 你需要知道的知识包括

+ Hexo 基本命令
+ html`<meta>`标签

## 对项目进行更改

### 为博客添加关键字
在hexo主题文件夹中(一般路径为themes/your-theme/layout)，找到`layout.ejs`文件，修改如下位置

``` html
  <meta name="keywords" content="<%- (page.keywords || config.keywords)%>">
  <meta name="description" content="<%- (page.description || config.description)%>">
```
并且在博客`.md`文件顶部的描述信息中添加
``` md
  ---
    ....
    keywords: 博客关键字
    description: 博客文章的概述
    ....
  ---
```
这样操作之后，会修改的博客网页的`<head>`标签中的部分`<meta>`标签，为当前页面添加关键字，增加搜索引擎检索的概率。

### 减少博客URL长度
修改根目录下`_config.yml`
``` yaml
....
permalink: :title.html
....
```

## 添加站点地图(sitemap.xml)



进入hexo项目的根目录下，安装插件
```shell
  npm i hexo-generator-baidu-sitemap #用于百度搜索
  npm i hexo-generator-sitemap 
```

修改根目录下`_config.yml`文件