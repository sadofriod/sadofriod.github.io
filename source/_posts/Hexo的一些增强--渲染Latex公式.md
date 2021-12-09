---
layout: interesting
title: Hexo的一些增强--渲染Latex公式
date: 2021-12-09 15:11:37
tags: interesting
p: interesting
categories: interesting
---

<!-- toc -->

## 阅读之前

你需要知道的知识包括
+ Hexo基本命令
+ Shell的使用
+ laTex的使用

前置的一些环境
+ Node.js
+ Linux shell/ macOS shell

## 对Hexo项目进行修改
### 依赖安装
首先进入到Hexo项目的根目录中，运行
``` shell
  npm install hexo-math hexo-renderer-pandoc #当你使用npm时
  # or
  yarn add hexo-math hexo-renderer-pandoc #当你使用yarn时
```

### 配置文件的修改
``` yml
  #插件
  markdown:
    plugins:
      ....
      - hexo-math #增加
  .....
  # 增加这一配置MathJax
  math:
    engine: 'mathjax'
    mathjax:
      src: https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-MML-AM_CHTML
```

## 系统命令安装
需要安装`pandoc`命令，用以支持LaTex的解析
``` shell
  brew install pandoc #当你使用macOS时
  # or
  sudo apt-get install pandoc #当你使用ubuntu时
```

## 尝试构建
如果已经构建过项目，请先进入项目根目录下运行，清除缓存
``` shell
  hexo clean
```

然后进行正常的hexo的生成和测试
``` shell
  hexo g & hexo s
```

测试LaTex，应能得到图1.1
<code>
  <pre>
$$
\begin{align*}
len = \sqrt{(X_{Split_{m}}-X_{SP})^{2}+(Y_{Split_{m}}-Y_{SP})^{2}}\\
\\
\theta = \arctan \frac{X_{Split_{m}}}{Y_{Slit_{m}}}\\
\\
Y_{offset} = len·\cos \theta \\
\\
C1=(X_{Split_{m}},Y_{Split_{m}}-len)\\
C2=(X_{Split_{m}},Y_{Split_{m}}+len)
\end{align*}
$$
  </pre>
</code>
<div style="display:flex;justify-contnet:center;align-items:center;flex-direction: column;">
<img width="300px" src="/images/equations.png">
<p> 图1.1</p>
</div>