---
title: High performance grouped list design
tags: project
p: project
categories: project
keywords: ''
date: 2021-12-28 07:26:36
---


## Overall goal
1. nested relationships exist in the grouping and there is no theoretical upper limit to the depth
2. Drag and drop elements out of the grouped list to create grouping relationships
3. ungrouped elements can be dragged into the group to create new grouping relationships
4. When ungrouped list items are moved, they will automatically cross over the group and its subcomponents
5. When ungrouped list items are grouped, the relative order before grouping should be maintained
6. when grouped list items are ungrouped, the relative order before grouping should be maintained
7. the above operation should also be valid for the direct operation of grouping (here the grouping is also operated as a list item)
## Analysis
+ Due to Objectives 1&5, the data structure should be kept in a one-dimensional structure, i.e. in the form of an array of objects. Such a data structure provides the base order of list items and facilitates maintaining the relative order of list items when creating groupings.
+ For objectives 2&3&5&6, the relative position of the grouped list items within the group should be recorded when calculating whether to create/update/delete grouping relationships for drag and drop items, to facilitate sorting the position of the list when the grouping relationships change
+ For Objective 7, grouping should be included as one of the list items. Provide the "type" field as a distinction between grouped list items and other lists, for possible expansion of the grouping expand/collapse function.
+ Render the list with a multi-dimensional structure to facilitate recursive rendering of the list, friendly to jsx syntax.
## Data structure design

List item data structure

```typescript
interface ListItem {
  code: string;
  groupCode: string;
}
```

List data structure

```typescript
type List = ListImte[]
```

Auxiliary data structure when updating grouping

```typescript
type GroupStack = {
  groupCode: string;
  index: number; // the real subscript of the group
  offsetNumber: number // the length of the group, for recording the relative position of the list items in the group
}[]
```

The data structure used for react rendering

```typescript
interface AssistStruct {
  code: string;
  children?: AssistStruct[];
  parentGroupCode?: string; //pop stack flag
}
```

## Algorithm selection

### One-dimensional object arrays into nested structures Design.

Detect group closure,The algorithm is a variant of the bracket closure algorithm.

If the group-code field in the current list item is not equal to the code at the top of the stack, the group is closed and the current stack top element is popped.

<img src="/images/group_list.png"/>

## Specific implementation

### One-dimensional array of objects converted to a nested structure implements.

```typescript
/**
 * Convert a one-dimensional array to a multi-layer structure
 * @param compCodes The code of all components
 * @param compDatas the data of all components
 * @returns returns the nested structure associated with code, the
 */
const subList = (compCodes: string[], compDatas: JDV.State['compDatas']): AssistStruct[] => {
  let groupStack: GroupStack[] = [];
  const resultData: AssistStruct[] = [];

  const stackPop = (groupCode?: string) => {
    let len = groupStack.length - 1;
    while (len >= 0) {
      if (groupStack[len].groupCode ! == groupCode) {
        groupStack.pop();
      } else {
        break;
      }
      len--;
    }
  };

  const setResult = (result: AssistStruct[], groupStack: GroupStack[], groupCode: string, value: AssistStruct) => {
    groupStack.forEach((item, index) => {
      if (!result) {
        return null;
      }
      if (!result[item.index]) {
        return;
      }
      if (result[item.index].code ! == groupCode) {
        // If the current component's group is not equal to the key in the result, search down
        return setResult(result[item.index].children as AssistStruct[], groupStack.slice(index + 1), groupCode, value);
      } else {
        if (result[item.index].children) {
          (result[item.index].children as AssistStruct[]).push(value);
          item.offsetNumber += 1;
        } else {
          result[item.index].children = [value];
        }
      }
    });
  };

  compCodes.forEach((item, index) => {
    const hasGroup = compDatas[item] ? compDatas[item].config.groupCode : undefined;
    stackPop(hasGroup);
    if (compDatas[item].compCode === 'group') {
      if (hasGroup) {
        // If the current component's parent is at the top of the stack, update the result tree
        setResult(resultData, groupStack.slice(0), hasGroup, {
          code: item,
          children: [],
        });

        // if the current group has a parent group, the group stack must not be empty, and the group index is the parent group length-1
        // debugger;
        groupStack.push({
          groupCode: item,
          index: groupStack.length ? groupStack[groupStack.length - 1].offsetNumber - 1 : index,
          offsetNumber: 0,
        });
      } else {
        groupStack = []; //no group, empty stack
        resultData.push({
          code: item,
          children: [],
        });
        //If the current group has no parent group, the group stack must be empty and the group index is the result length
        groupStack.push({
          groupCode: item,
          index: resultData.length - 1,
          offsetNumber: 0,
        });
      }
    } else {
      if (hasGroup) {
        // If the current component's parent is at the top of the stack, update the result tree
        setResult(resultData, groupStack.slice(0), hasGroup, {
          code: item,
        });
      } else {
        groupStack = []; //no group, empty stack
        resultData.push({
          code: item,
        });
      }
    }
  });
  return resultData;
```

Translated with www.DeepL.com/Translator (free version)