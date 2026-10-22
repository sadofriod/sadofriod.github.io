---
title: Controlling the Loading Component Functionally in React Native
tags: project
p: project
categories: project
keywords: 'React Native Loading,loading component,HOC,functional component,loading state management,react native loading component'
date: 2024-09-06 06:21:00
lang: en
translationKey: 在React Native中函数式的控制Loading Component
---



# What you need to know before reading
- What React Context is
- How to write a custom Hook

# Why we need to control the Loading Component functionally
In app development we often encounter asynchronous operations, such as fetching data over the network. While the user performs these operations, we usually need to show some kind of prompt component to indicate the state of the network request.
The simplest implementation is to maintain an internal state, update it in sync with the state changes of the network request according to business requirements, and decide whether the Loading Component renders based on that state. Sample code below

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

From the code above it is easy to see that with this simple implementation, we have to manually add the Loading Component on every page that needs to display it, and also add an internal state to control its visibility. That is inevitably redundant. If we can control the Loading Component with a functional call style like the following, a large amount of redundant code will be eliminated

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

# Problems to solve
1. Unlike the web, in mobile development we cannot directly call native methods like UIView to add new Elements
2. Keep maximum compatibility and avoid depending on special APIs provided by the mobile platform as much as possible


# Implementation

## Design idea
For such a Loading Component, only one instance needs to exist in the whole app, mounted at the outermost layer of the app, and then its render-controlling functions are shared through React Context. This way we can control the Loading Component from any component or Hook.

## Code
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
	const loadingContextValue = { show: handleShow };
	return (
		<GlobalLoadingContext.Provider value={loadingContextValue}>
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

