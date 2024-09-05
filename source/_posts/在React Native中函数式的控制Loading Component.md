---
title: 在React Native中函数式的控制Loading Component
tags: project
p: project
categories: project
keywords: 'React Native Loading,React Native, functional Loading Component'
date: 2024-09-06 06:21:00
---

<!-- toc -->

# 阅读前你需要知道的
- React Context是什么
- 如何自定义Hooks

# 为什么需要函数式的控制Loading Component
在APP的开发中，我们经常会遇到一些异步的操作，比如通过网络请求获取数据。在用户进行这类操作的时候，一般需要弹出一些提示的组件，用来表示这次网络请求所处的状态。
最简单的实现方法是维护一个内部State，在网络请求的状态发生变化的时候，按照业务需求同步更新这个内部状态，并且根据这个状态来决定Loading Component是否渲染，代码示例如下

```typescript
const TestLoading = () => {
	const [isError, setIsError] = useState(false)
	const handleRequest = async () => {
		try {
			await requestAPI()
			setIsError(false)
		}catch(e){
			setIsError(ture)
		}
	}
	return (
		<>
			<Button title='request' onPress={handleRequest} />
			<Modal visible={isError}>
				<ActivityIndicator size="large"/>
			</Modal>
		</>
	)
}
```

从上面的代码我们不难看出，如果使用和这种简单的实现方式，需要在每个需要展示Loading Component的页面，手动添加它，并且还需要增加一个内部状态来控制它的展示。这不免显得有些冗余，如果过我们可以使用如下的函数式的调用方式来控制Loading Component，将大量减少冗余代码

```typescript
const TestLoading = () => {
	//...
	const handleRequest = async () => {
		showLoading()
		await requestAPI()
		closeLoading()
	}
	//...
	return (
		<Button title='request' onPress={handleRequest} />
	)
}
```

# 要解决的问题
1. 和web不同的是，在Mobile的开发中，我们无法直接调用类似UIView这类的原生方法来增加新的Element
2. 保持最大的兼容性，尽量不依赖Mobile平台提供的特殊API


# 实现

## 设计思路
对于这样的Loading Component在整个APP中可以只存在一个这样的组件，并将它在APP的最外层进行挂载，然后在通过React Context共享它的控制渲染的函数。这样，我们就可以在任意一个组件或者Hook中控制Loading Component了。

## 代码
```typescript
// GlobalLoaidngProvider.tsx
export const GlobalLoadingContext = React.createContext({
	show: console.log
	close: console.log
});

export const GlobalLoadingProvider: React.FC<React.PropsWithChildren> = ({
	children
}) => {
	const [isShow, setIsShow] = useState(false);
	const [message, setMessage] = useState('');
	const handleShow = (message?: string) => {
		setIsShow(true);
		message && setMessage(message);
	}
	const handleClose = () => {
		setIsShow(false)
	}
	return (
		<GlobalLoadingContext.Provider value={{
			show: handleShow,
		}}>
			{children}
			<Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
       >
				
				<ActivityIndicator size='large' />	
				<Text>{message}</Text>
			</Modal>
		</GlobalLoadingContext.Provider>
	)
}

// App.tsx
// ...
const App = () => {
	//...
	return (
		<GlobalLoadingProvider>
			{//... you component}
		</GlobalLoadingProvider>
	)
}

//RequestAPIButton.tsx

const RequestAPI = () => {
	const {show, close} = useContext(GlobalLoadingContext)
	const handleRequest = async () => {
		show("data lading");
		await requestAPI();
		close();
	};
	
	return(
		<Button onPress={handleRequest} title="requestAPI" />
	)
}
```


