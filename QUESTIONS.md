# 8. How many arguments does setState take and why is it async.

In the class version of a React component, the `setState` method accepts two arguments. The first one is the next state that can be either an object, string, etc. or a callback that receives the previous state as argument. The second one is a callback that will be executed after the state is updated.

In the hooks version, the `setState` from `useState` accepts only one argument, in the same rules as the class version. It can be the raw next state, like an object, array, string, etc.. Or a callback that receives the previous state as argument.

The `setState` method is async because it causes the component to rerender which can be an expensive computation.

Also, `setState` is not async in the form of a Promise, that we can `await` or `.then`, instead, when calling `setState` what React does is append this update request to a queue that will be later executed.

# 11. How to render an HTML string coming from the server.
 
We can render HTML in React using the `dangerouslySetInnerHTML` property in a JSX tag. However, dealing with raw HTML can open doors to vulnerabilities like XSS, to avoid that the HTML must be sanitized, removing anything that can be malicious like iframe or event handlers attached to elements

Example:

```jsx

const danger = `<b onmouseover="alert('mouseover');">Text</b>`;

const Component = () => {
  return <div dangerouslySetInnerHTML={{ __html: danger }}/>
}
```

When rendering this component and hovering the "Text" element, an alert will be shown.