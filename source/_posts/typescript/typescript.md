---
title: 在TS中使用字符串作为索引访问对象
p: typescript
date: 2020-01-04 11:21:00
tags: typescript
categories: typescript
---
## 场景 & 问题
在访问对象的成员变量时，经常会用到使用字符串作为索引。在JS中，这样的用法是可以的。但是在TS中，当被访问的对象被赋予类型之后，这样的操作将会抛出异常，示例如下：
## JS中
``` js  
const testObj = {
    key1: 1,
    key2:2
};

// 获得存有当前对象所有Key（浅层）的一个数组 ["key1"，"key2"]
const tempKeys = Object.keys(testObj); 
tempKeys.forEach((item)=>{

    // 正常输出testObj中的值
    console.log(testObj[key]); 
});
``` 
上述代码将输出我们预期的结果。


## TS中

``` ts
interface TestObjType {
    key1:number;
    key2:number;
}
const testObj:TestObjType = {
    key1:1,
    key2:2
}
type tempKeysType = keyof TestObjType

// 获得存有当前对象所有Key（浅层）的一个数组 ["key1"，"key2"]
const tempKeys = Object.keys(testObj) as Array <keyof TestObjType>; 

//这里将会有一个报错，提示 :
//参数“item”和“value” 的类型不兼容。`不能将类型“string”分配给类型“"key1" | "key2"”.
//这表明了，即使tempKeysType是通过keyof 从TestObjType中获取到的，但是forEach的callback的参数类型，仍然无法通过TS的类型兼容性检查。
tempKeys.forEach((item:tempKeysType)=>{ 

//这里也会有一个报错：Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'TestObjType'。
// TS的类型推断，表示item存在隐式的any类型，而any类型在TS中无法作为obj的索引。同样这也表示了在进行对象的遍历时（在当前代码片段中），不能将any作为item的类型，去访问对象
    console.log(testObj[key]); 
});

tempKeys.forEach((item:string)=>{ 
    
    //这里会有同样报错
    console.log(testObj[key]); 
});
```

## 解决思路
对于这一问题的出现，猜测可能是由于在
``` ts
const tempKeys = Object.keys(testObj) as Array <keyof TestObjType>; 
```
但此时可以看到，tempKeys的类型已经变成了
``` ts
("key1"|"key2")[]
```
所以问题很可能是由 **Object.keys**的默认值导致的。 
由此可得如下解决方案

## 解决方案

对于此问题，需要封装一个新的 **keys** 函数来解决

``` ts
// 新的keys函数，使用O继承object
function keys<O extends object>(obj: O): Array<keyof O> {
  return Object.keys(obj) as Array<keyof O>;
}

interface TestObjType {
    key1:number;
    key2:number;
}
const testObj:TestObjType = {
    key1:1,
    key2:2
}
type tempKeysType = keyof TestObjType

// 使用新的keys获得存有当前对象所有Key（浅层）的一个数组 ["key1"，"key2"]
const tempKeys = keys(testObj) ; 

tempKeys.forEach((item:tempKeysType)=>{ 
    console.log(testObj[key]); 
});
```
上述代码将输出我们预期的结果。
