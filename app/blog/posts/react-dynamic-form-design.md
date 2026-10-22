---
title: React "Dynamic" Form Design (Part 1)
tags: project
p: project
categories: project
keywords: 'react dynamic form, low-code form engine, form rendering engine, JSON Schema form, Turing-complete form, frontend form design, visual form builder, react dynamic form builder'
date: 2024-03-23 21:12:31
lang: en
translationKey: 动态表单设计
---



# React "Dynamic" Form Design (Part 1)
In this part I'll define what a dynamic form is, what problems you hit when building one, and give its basic data structures and the generation function.
In the next part I'll go into more detail on how field values are stored in such a form, and how to implement these features and components.

## What is a dynamic form
In a typical B/S architecture project, we sometimes need to give different users forms containing different fields, based on their permissions and needs.

Take a ticket system with three roles. The people who can accept tickets (A and B), and the person who reviews ticket progress (C). For A, he may need to fill in the start and end times of ticket handling, confirming when he can work on the ticket. If A accepts the ticket but finds he can't finish it within the agreed time, he can share the ticket with B. Then what B sees should not be editable, and B can choose to accept or decline. When A and B have finished the ticket, C should receive a completion review. C can see all the ticket's information and choose whether to close it.

For the business logic above, most of a form's content is reused three times (ticket number, assignee and other fields), while A, B and C each have their own special fields and actions, and these differences in visibility come entirely from data pushed down by the server. So for this kind of scenario, can we compose the final rendered form from reused fields plus each person's special actions? A dynamic form solves exactly this problem.

Of course, given the brief description above, intuition probably pushes us toward this approach:
```typescript
const userInfo = getUserInfo();
const {isResolverSelf, isJudger} = userInfo;
const renderForm = () => {
	if(isResolverSelf){
		return <FullEditableForm/>;
	}
	if(isJudger){
		return <CloseActionForm />;
	}
	if(!isResolverSelf){
		return <ReciveSharedForm />;
	}
}
return renderForm();
```
But as roles multiply and permission control gets finer, `renderForm` balloons quickly and maintenance cost goes up.
So when your system has a foreseeable expansion in requirements, consider an implementation like a dynamic form.

## Problems to solve
To build such a form, we need to handle the following:
- Provide the components that may appear in the form (controllable components), and unify their `onChange`, `value`, `label` and other props.
- Design how data is stored in state management, to make interaction between components, linkage, and final form submission convenient.
- Design a UI rendering engine that renders the UI correctly by receiving a configuration file.
- Provide unified actions, including common form actions such as `onChange`, `onInValid`, `onSubmit`, `onCancel`.
- (Optional) Performance optimization when the form's state changes frequently due to operations outside the form.

## Prerequisites
Knowledge you need for what follows:
- typescript
- React
- Common React hooks, such as useContext, useReducer, useState
The code in the following sections will use them.

## Module design overview
Such a dynamic form system roughly consists of these 4 modules:
1. UI rendering engine
2. Form field components.
3. State management
4. Form action functions
Next, let's look at how to design these three modules one by one.

### UI render
For the UI rendering engine, we generally have two data structures to choose from.
One is a flat data structure, such as:
```typescript
enum ComponentTypeEnum {
  text = 0,
  select = 1,
  checkbox = 2,
  container = 3
}

interface FormFieldUIProps {
	value: string | number | boolean;
	label: string | ReactNode;
  componentType: ComponentTypeEnum;
	name: string; // unique 
	parentField: string; // it will save other field name
  // The componentsProps should from field component. e.x the select component should has options;
  required?: boolean;
  componentsProps: Props 
};
type FormUIStruct = FormFieldUIProps[];
```
The other is a nested data structure, such as:
```typescript
interface FormFieldUIProps {
	value: string | number | boolean;
	label: string | ReactNode;
  componentType: ComponentTypeEnum;
	name: string;
  required?: boolean;
  components: Props;
	children: FormFieldUIProps[];
};
type FormUIStruct = FormFieldUIProps[];
```
Let's compare the characteristics of these two data structures first:

<table>
  <thead>
     <tr>
        <td></td>
        <td>Flat data structure</td>
        <td>Nested data structure</td>
      </tr>
  </thead>
  <tbody>
    <tr>
      <td>When rendering</td>
      <td>Must be converted to a nested structure to render</td>
      <td>Can be rendered directly</td>
    </tr>
    <tr>
      <td>When looking up a form item</td>
      <td>Look up directly by name</td>
      <td>Must search with DFS</td>
    </tr>
    <tr>
      <td>Readability</td>
      <td>Completely different from DOMTree, the parent-child relation is hard to see</td>
      <td>Highly similar to the parent-child relation in DOMTree</td>
    </tr>
    <tr>
      <td>Reusability</td>
      <td>Must consider uniqueness of name</td>
      <td>Multiple levels of nesting give natural isolation, name needn't be unique</td>
    </tr>
  </tbody>
</table>
Neither data structure is clearly better; each is useful in different scenarios.
For example, given the characteristics of the flat structure, if your form frequently sees CRUD operations on form items, its fast lookup suits that scenario well.
If your form configuration needs to reuse a lot of things as `children`, the nested structure suits that scenario well.
So based on the above, we should choose the data structure according to the concrete use case.

PS: **To describe the makeup of this system more intuitively, I'll use the nested data structure as the data structure for UI rendering.**

### State management
PS: **To better present the system's design, I'll minimize third-party dependencies, so state management will be implemented with React's Context and hooks.**
As stated above, state management needs to collect changes to form item values, and notify the components associated with them to update. After the form is filled out, it must support submitting and canceling changes.
Based on that, we need the following code:
```typescript
interface FieldValueCollection {
	[key in string]: FormFieldUIProps['value'];
};
interface FieldActionsCollection {
	submit: (fieldValues: FieldValueCollection) => void;
	reset: () => void;
	handleValueChange: (cachePath: string, value: FormFieldUIProps['value']) => void;
}
```

### Action Design
```typescript
type validForm = () => {
  [key in keyof FieldValueCollection]: message;
} | undefined
type submitForm = () => void;
type resetForm = () => void;
// we want change run some actions when the value updated in path
type getValueByPath = (path: keyof FieldValueCollection) => FormFieldUIProps['value'];
```

## Describing forms with a DSL
Now that I've defined the data structure describing a form, we pass this data structure as the input of a DSL interpreter function to generate a complete form. That function is implemented as follows:
```typescript
const renderForm = (conf: FormUIStruct) => {
  const travelConf = (conf?: FormUIStruct, combinePath: string = '', listIndex: number =NaN) => {
    conf?.forEach((item, index) => {
      if (!item) {
        return null;
      }
      const { children, componentType, name } = item;
      if (componentType === ComponentTypeEnum.container) {
        const newCombinePath = isNaN(listIndex) ? `${combinePath}.${name}` : `${combinePath}.${listIndex}.${name}`;
        return (
          <FieldContainer key= { combinePath } path = { combinePath }>
            { travelConf(children, newCombinePath)}
          </FieldContainer>
        )
      }else if (componentType === ComponentTypeEnum.list){
        const newCombinePath = `${ combinePath }.${ name } `;
        return (
          <FieldListContainer key= { combinePath } path = { combinePath } >
            { travelConf(children, newCombinePath, index)}
          </FieldListContainer>
        )
      }
      else{
        const newCombinePath = `${ combinePath }.${ name } `;
        return (
          <FieldComponent { ...item } key = { combinePath } path = { newCombinePath } />
        )
      }
    })
  }
  return travelConf(conf);
}
```
