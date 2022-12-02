---
title: JS开发中函数式编程的一些经验
tags: project
p: project
categories: project
keywords: ''
date: 2022-11-30 22:33:43
---
<!-- toc -->
## 减少[副作用](https://zh.m.wikipedia.org/zh-hans/%E5%89%AF%E4%BD%9C%E7%94%A8_(%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%A7%91%E5%AD%A6)#:~:text=%E5%9C%A8%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%A7%91%E5%AD%A6%E4%B8%AD%EF%BC%8C%E5%87%BD%E6%95%B0,%E6%80%A7%E4%B8%8E%E5%8F%AF%E7%A7%BB%E6%A4%8D%E6%80%A7%E3%80%82)
以下是wiki对于副作用的定义。
> 在计算机科学中，函数副作用指当调用函数时，除了返回可能的函数值之外，还对主调用函数产生附加的影响。例如修改全局变量（函数外的变量），修改参数，向主调方的终端、管道输出字符或改变外部存储信息等。<br/>
>在某些情况下函数副作用会给程序设计带来不必要的麻烦，给程序带来十分难以查找的错误，并降低程序的可读性与可移植性。严格的函数式语言要求函数必须无任何副作用，但功能性静态函数本身的目的正是产生某些副作用。在生命科学中，副作用往往带有贬义，但在计算机科学中，副作用有时正是“主要作用”。
### 为什么要减少副作用
在数学中我们会遇到这样的函数`y=x+1`，一旦我们确定了**x**的值，那么无论我们在什么时候使用这个函数，得到的**y**的值始终不会发生变化。<br/>
即使，更为复杂的数学公式，比如
$$
\begin{align*}
\frac{n(n-1)}{2n}
\end{align*}
$$
也符合上述规律。
在程序开发中，我们也会定义一些函数，但这里面的一些函数会随着不同时间和上下文调用出现变化。一个简单的例子：
```javascript
let variable = 1;
const printVariable () => {
  variable++;
  console.log(variable)
}
printVariable() //输出: 2
printVariable() //输出: 3
```
一旦这样的函数被大量使用，尤其是作为公共函数在多人开发使用的时候时，会存在一些隐患。用下面的代码来说明这个问题：
```typescript
// util.ts
type User = {
  root: 'normal' | 'admin' | 'guest'
}
export const users:User[] = [{
  root: 'guest'
},{
  root: 'admin'
},{
  root: 'normal'
},];
export const converAllUsersTonNormal = () =>{
  users.forEach((item)=>{
    if(item.root !== cacheUser.root){
      item.root === 'normal'
    }
  })
}
// developerA.ts
import {users} from '@path/util'
const isAllUsersNormal = () =>{
  return users.every(item=>{
    if(user.root !== 'normal'){
      return true;
    }
    return false;
  })
}
// developerA.ts
isAllUsersNormal() // converAllUsersTonNormal没有在任何地方调用,输出 false
isAllUsersNormal() // converAllUsersTonNormal被调用过,输出 true
```
显而易见的是，在上面的例子中，如果无法确定两个开发者提供的函数调用次数，那么最终我们得到的结果将是无法确定的。<br/>
所以，减少**副作用**就可以减少上述的情况出现，尽可能的降低bug的出现。以下我列举了两个减少副作用的方式。
### 使用函数替代一些简单的赋值
比如下面的代码
```typescript
type response = {
  code: number;
}
const getResponseMsg = () => {
  let result = '';
  if(respose.code === 200){
    result = 'success'
  }else{
    result = 'error: '
    if(respose.code === 404){
      result += 'url not found'
    }
    if(respose.code === 500){
      result += 'server has error'
    }
    result += 'unknown error'
  }
  return result;
}
// 用函数替代后
const getResponseMsgFunctional = () => {
  if(respose.code === 200){
    return 'success'
  }else{
    const getErrorMsg =(msg:string)=> 'error: '+ msg;
    if(respose.code === 404){
      return getErrorMsg('url not found');
    }
    if(respose.code === 500){
      return getErrorMsg('server has error');
    }
    return getErrorMsg('unknown error');
  }
  return result;
}
```
这里可以看到 `getResponseMsgFunctional`在 `code !== 200`时的处理，用`getErrorMsg`替换了原本，对`result`重新赋值的操作。再消除了副作用的同时，也增强了代码的可拓展性和内聚程度，因为一旦之后的有新的需求，可能对`errorMsg`的前缀产生影响，
那么后续的更改，可以完全在`getErrorMsg`中进行。
### 对于引用类型的修改
在JS中，引用类型的修改从来都是非常容易出现BUG的操作之一。比如，一个引用类型的变量暴露给多个开发者使用。
这里推荐用函数替代对于引用的直接修改。比较成熟的方案如[redux](https://redux.js.org/)。<br/>
虽然我们用诸如redux的方案解决了直接修改引用类型，带来的不确定性问题。但同时，这样的设计也存在一些性能问题。<br/>
主流的前端框架中，如果一个组件的props是一个引用类型，那么确定该组件是否需要更新，一般都是进行引用的直接对比。这时，如果一个深层redux对象被共享给了多个组件，那么某一层的更新，可能会引起其他组件的不必要更新。为了解决这个问题，我们可能需要做很多额外的
工作，来确定该组件是否真的需要更新。
## [高阶过程](https://zh.m.wikipedia.org/zh/%E9%AB%98%E9%98%B6%E5%87%BD%E6%95%B0)，自上而下的设计
在开发过程中，我们不可避免的会遇到一些非常复杂的需求。可能是需要重构一个关联了很多其他模块的函数，可能是深度遍历一个复杂对象并根据每层对象的一些属性调用一些其他的函数。
遇到这些复杂的情况，我们可以用高阶过程去解决这类问题。
一个简单的例子，用递归便利数组。
```typescript
const arrayIterator = (
  arr: any[],
  condition: (...arg?: any[])=> boolean, 
  action: (...arg?: any[])=>void,
) =>{
    if(condition()){
      action()
      return arrayIterator(arr.slice(1),condition,action)
    }else{
      return;
    }
}
```
事实上我们可以这样看待上面的代码
```typescript

const dataOperation = (data: any) =>{
  // do something for generate `newData`
  return newData
}

const arrayIterator = (
  data: any,
  condition: (...arg?: any[])=> boolean, 
  recursionAction?: (...arg?: any[])=>any,
  recursionEndAction?: (...arg?: any[])=>any,
) =>{
    if(condition()){
      recursionAction()
      return arrayIterator(dataOperation(data),condition,action)
    }else{
      return recursionEndAction()
    }
}
```
这意味着，大部分递归都可以用这样的方式进行拆分。拆分后的递归将拥有很强的拓展性。而且维护每个部分的心智负担将降低，修改某个部分只需要关注函数内部逻辑，而不用整体的考虑。