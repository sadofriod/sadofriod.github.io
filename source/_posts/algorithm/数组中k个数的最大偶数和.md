---
title: 数组中k个数的最大偶数和
date: 2020-05-26 15:43:28
tags: algorithm
p: algorithm
categories: algorithm
---
## 题目
长度为m的数组，是否存在k个数的和为偶数，且和为最大和。
example：

```javascript
input: [123,12,424,32,43,25,46] 4;
output: 636;

input:[1000] 2;
output:-1

input: [1,3,5,7,9] 3;
output: -1
```

## 分析过程 

首先判断数组M的长度是否小于k，如果小于k，则直接返回-1。
如果数组长度不小于k，则对现有数组进行排序，取排序结果N的前k位的和。判断当前k个数的和是否是偶数，如果是，返回当前和。如果不是，则循环判断排序N-K~N位置中是否存在一个数，使得结果成立。
ps：这里只判断是否存在一个数是因为，当最大和存在，但不为偶数的情况成立，则k mod 2 ≠ 0且构成N的数都为奇数。

## 排序方式
将数组的第Q项作为基准项（基准项为base。这里将Q取为0，但事实上，用任意一项都可以）。判断M[i]（0<＝i<M）是否大于base，如果大于，则替换base与M[i]值的位置，调换之后，遍历i-1～0（M的子数组subM，该数组已经是有序数组），将M[i]的值插入到subM中。如果小于等于，base＝M[i]。

## 逻辑结构
排序的过程是按照中序遍历创建一颗二叉树，只要树的最左子树的节点个数等于k，则这个子树就是数组的最大和。如果最大和不是偶数，则按照中序遍历的规则，顺序寻找上层子树的节点是否存在可以满足的值。
 
## 代码

```javascript
const result = (test, k) => {
	let base = test[0];
	let sum = 0;
	let tempK = 0;
	let sort = 0;
	let tempOutside = 0;
	let tempInside = 0;
	let baseIndex = 0;
	if (k > test.length) {
		return -1;
	}
	for (let index = 1; index < test.length; index++) {
		const element = test[index];
		if (element > base) {
			tempOutside = test[index];
			test[index] = base;
			test[baseIndex] = tempOutside;
			for (let j = index - 1; j >= 0; j--) {
				if (element > test[j]) {
					tempInside = test[j];
					test[j] = test[j + 1];
					test[j + 1] = tempInside;
				}
			}
		} else {
			base = test[index];
		}
		baseIndex++;
	}
	while (tempK < k) {
		sum += test[sort];
		if (tempK === k - 1 && sum % 2 !== 0) {
			sum -= test[tempK];
			tempK--;
		}
		tempK++;
		sort++;
	}
	return sum;
};
```