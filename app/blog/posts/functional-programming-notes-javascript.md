---
title: Some Experience with Functional Programming in JS Development
tags: project
p: project
categories: project
description: Functional programming, functional programming in JS
date: 2022-11-30 22:33:43
mathjax: true
keywords: 'JS functional programming,functional React,pure functions,currying,point-free,immutable data,functional programming javascript'
lang: en
translationKey: JS开发中函数式编程的一些经验
---
# Some Experience with Functional Programming in JS Development


## Prerequisites

What you need to know before reading

+ [What is a side effect](https://zh.m.wikipedia.org/zh-hans/%E5%89%AF%E4%BD%9C%E7%94%A8_(%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%A7%91%E5%AD%A6)#:~:text=%E5%9C%A8%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%A7%91%E5%AD%A6%E4%B8%AD%EF%BC%8C%E5%87%BD%E6%95%B0,%E6%80%A7%E4%B8%8E%E5%8F%AF%E7%A7%BB%E6%A4%8D%E6%80%A7%E3%80%82)

+ [What is a higher-order procedure](https://zh.m.wikipedia.org/zh/%E9%AB%98%E9%98%B6%E5%87%BD%E6%95%B0)
## Reducing side effects
Below is the definition of a side effect from Wikipedia.
> In computer science, a function side effect means that when a function is called, besides returning a possible function value, it also produces an additional influence on the calling function. For example, modifying a global variable (a variable outside the function), modifying parameters, outputting characters to the caller's terminal or pipe, or changing externally stored information.<br/>
>In some cases function side effects bring unnecessary trouble to program design, introduce errors that are extremely hard to find, and reduce the readability and portability of a program. Strict functional languages require functions to have no side effects at all, but the very purpose of functional static functions is to produce certain side effects. In life sciences, side effects are often derogatory, but in computer science, side effects are sometimes precisely the "main effect".
### Why reduce side effects
In mathematics we encounter functions like `y=x+1`; once we have fixed the value of **x**, no matter when we use this function, the value of **y** we get never changes.<br/>
Even more complex mathematical formulas, such as
$$
\begin{align*}
\frac{n(n-1)}{2n}
\end{align*}
$$
also follow the rule above.
In program development we also define functions, but some of these functions change depending on the time and context in which they are called. A simple example:
```javascript
let variable = 1;
const printVariable () => {
  variable++;
  console.log(variable)
}
printVariable() // output: 2
printVariable() // output: 3
```
Once such a function is used heavily, especially as a shared function used by multiple developers, there are hidden risks. The following code illustrates the problem:
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
isAllUsersNormal() // converAllUsersTonNormal is never called; output false
isAllUsersNormal() // converAllUsersTonNormal has been called; output true
```
It is obvious that in the example above, if we cannot determine how many times the functions provided by the two developers are called, the final result we get will be undeterminable.<br/>
So reducing **side effects** can reduce the situations above and lower the chance of bugs as much as possible. Below I list two ways to reduce side effects.

### Use functions to replace some simple assignments
For example, the following code
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
// after replacing with functions
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
Here you can see how `getResponseMsgFunctional` handles the `code !== 200` case: `getErrorMsg` replaces the original reassignment of `result`. While eliminating side effects, it also improves the extensibility and cohesion of the code, because if a later requirement affects the prefix of `errorMsg`,
all subsequent changes can be made entirely inside `getErrorMsg`.

### Modifications to reference types
In JS, modifying reference types has always been one of the operations most prone to bugs. For example, a variable of reference type is exposed to multiple developers for use.
Here it is recommended to use functions instead of modifying references directly. A fairly mature solution is [redux](https://redux.js.org/).<br/>
Although solutions such as redux solve the uncertainty caused by directly modifying reference types, such a design also has some performance problems.<br/>
In mainstream frontend frameworks, if a component's props are of a reference type, whether the component needs to update is usually determined by a direct reference comparison. At this point, if a deeply nested redux object is shared among multiple components, an update at one level may trigger unnecessary updates in other components. To solve this, we may need to do a lot of extra
work to determine whether the component really needs to update.

## Higher-order procedures, top-down design
During development we inevitably run into some very complex requirements. It might be refactoring a function that is coupled with many other modules, or deeply traversing a complex object and calling other functions based on some properties of the object at each level.
For these complex situations, we can use higher-order procedures to solve such problems.
A simple example: traversing an array with recursion.
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
In fact we can look at the code above this way
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
This means most recursion can be split this way. The split recursion will be highly extensible. And the mental burden of maintaining each part is reduced: to modify one part you only need to focus on the logic inside that function, instead of having to consider the whole.
