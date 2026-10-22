---
layout: interesting
title: Hexo + LaTeX math rendering
date: 2021-12-09 15:11:37
tags: interesting
p: interesting
categories: interesting
keywords: 'hexo latex,hexo mathjax,hexo katex,hexo math formulas,hexo rendering'
lang: en
translationKey: Hexo的一些增强--渲染Latex公式
---



## Before you read

### What you need to know

+ Basic Hexo commands
+ Working with the shell
+ Using LaTeX

### Prerequisites

+ Node.js
+ Linux shell / macOS shell

## Modifying the Hexo project
### Installing dependencies
First go to the root directory of your Hexo project and run
``` shell
  npm install hexo-math hexo-renderer-pandoc #when you use npm
  # or
  yarn add hexo-math hexo-renderer-pandoc #when you use yarn
```

### Editing the configuration file
``` yml
  #plugins
  markdown:
    plugins:
      ....
      - hexo-math #add this
  .....
  # add this MathJax configuration
  math:
    engine: 'mathjax'
    mathjax:
      src: https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-MML-AM_CHTML
```

## Installing the system command
You need to install the `pandoc` command to support LaTeX parsing
``` shell
  brew install pandoc #when you use macOS
  # or
  sudo apt-get install pandoc #when you use ubuntu
```

## Trying the build
If you have already built the project, first go to the project root directory and clear the cache
``` shell
  hexo clean
```

Then run the normal Hexo generate and test
``` shell
  hexo g & hexo s
```

Test LaTeX, and you should get Figure 1.1
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
<p> Figure 1.1</p>
</div>
