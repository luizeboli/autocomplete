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