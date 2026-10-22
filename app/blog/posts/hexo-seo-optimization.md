---
layout: interesting
title: Hexo SEO optimization
date: 2021-12-23 13:34:53
tags: interesting
p: interesting
categories: interesting
keywords: 'hexo seo,hexo baidu indexing,hexo sitemap,standalone blog SEO,hexo optimization'
lang: en
translationKey: hexo-seo-优化
---


## Before you read

### What you need to know

+ Basic Hexo commands
+ The HTML `<meta>` tag

## Making changes to the project

### Adding keywords to your blog
In your Hexo theme folder (usually `themes/your-theme/layout`), find the `layout.ejs` file and modify the following section

``` html
  <meta name="keywords" content="<%- (page.keywords || config.keywords)%>">
  <meta name="description" content="<%- (page.description || config.description)%>">
```
And add the following to the description block at the top of your blog's `.md` files
``` md
  ---
    ....
    keywords: blog keywords
    description: a summary of the blog post
    ....
  ---
```
After doing this, some of the `<meta>` tags in the blog page's `<head>` element will change, adding keywords for the current page and increasing the chance of being picked up by search engines.

### Shortening your blog URLs
Modify `_config.yml` in the root directory
``` yaml
....
permalink: :title.html
....
```

## Adding a sitemap (sitemap.xml)



Go to the root directory of the Hexo project and install the plugins
```shell
  npm i hexo-generator-baidu-sitemap #for Baidu search
  npm i hexo-generator-sitemap 
```

Modify the `_config.yml` file in the root directory
