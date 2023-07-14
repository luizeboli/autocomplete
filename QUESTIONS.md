# 1. What is the difference between Component and PureComponent? Give an example where it might break my app.

The difference that I can remember is the `Component` will rerender whenever the state or props changes, on the other hand, a `PureComponent` implements the `shouldComponentUpdate` with a shallow comparison (checking if they are equal by value in case of primitives, and equal by reference in case of objects) on both state and props. If they are equal then the component will not rerender.

This can be a problem when the state is mutated, preventing the component to be rerendered as the object reference will be the same as the previous render.

Example:

```jsx
export default class App extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      array: [1]
    };

    this.handleUpdate.bind(this);
  }

  handleUpdate = () => {
    const array = this.state.array;
    array.push(2);
    this.setState({ array });
  };

  render() {
    return (
      <div className="App">
        <p>{JSON.stringify(this.state.array)}</p>
        <button onClick={this.handleUpdate}>Click to Update</button>
      </div>
    );
  }
}
```

On the above example we are mutating the `this.state.array` array, so when updating it by clicking the `Click to Update` button does not triggers a rerender in the component as its a `PureComponent`. However, the component would rerender if it was a `Component`

# 2. Context + ShouldComponentUpdate might be dangerous. Why is that?

From my experience with the actual Context API this is not a problem, even returning `false` from the `shouldComponentUpdate` triggers a rerender in the component. Maybe it was a problem with the legacy Context Api, but I've never used it so I cannot make statements.

# 3. Describe 3 ways to pass information from a component to its PARENT.

React renders components in a tree format

App
└── Header
└── Content
    ├── Sidebar
    └── Article

So the usual way of passing data to components is down the tree, from the parent to the children. Passing data this way makes it easier to debug as we know the data flow is always from the top to the bottom, so we can better trace where the problem is.

However, there are some ways we can achieve passing data from a children to its parent:

1. Receiving a callback and executing it with the new data

```jsx
const Parent = () => {
  const handleUpdateData = () => {
    // ...
  }

  return <Children updateData={handleUpdateData} />
}

const Children = ({ updateData }) => {
  return <button onClick={() => updateData()}>Click to update</button>
}
```

2. Using the Context API

```jsx

const Context = createContext()

const Parent = () => {
  const handleUpdateData = () => {
    // ...
  }

  return <Context.Provider value={{ handleUpdateData }}><Children /></Context.Provider>
}

const Children = ({ updateData }) => {
  const { handleUpdateData } = useContext(Context)
  return <button onClick={() => handleUpdateData()}>Click to update</button>
}
```

3. Using the hook `useImperativeHandle`

```jsx
const Parent = () => {
  const ref = useRef()

  return <><Children ref={ref} />{JSON.stringify(ref.current?.data ?? {})}</>
}

const Children = forwardRef({ updateData }, ref) => {
  const [data, setData] = useState({})

  useImperativeHandle(ref,
  () => ({
    data,
  }), [])

  return <button onClick={() => setData({})}>Click to update</button>
}
```

We should always keep in mind the state flow of the application, so we can try things like lifting the state up to the parent or common parents and remove the state from the children and pass it as props.

# 4. Give 2 ways to prevent components from re-rendering.

In class Components we can prevent a rerender using `PureComponent` or implementing `shouldComponentUpdate` by ourselves.

In the functional components there are some ways we can prevent a rerender:

1. Using the `React.memo` (it's the `shouldComponentUpdate` functional version)

```jsx
const Component = React.memo(() => {
  return <div />
})
```

This function receives a second parameter that is a function that should return if the component props are equal to the previous render, if so the component does not rerender.

This will prevent rerenders caused by prop changes, but no state or context changes.

If we want to skip rerender based on state or context we might have to create a new parent component that pass the value down as props.

2. Using the `useMemo` in a parent

```jsx
const Component = () =>{
  const [state, setState] = useState({});

  const ChildComponent = useMemo(() => {
    return <div data-testid="children" />;
  }, []);

  return (
    <div>
      {ChildComponent}
      <button onClick={() => setState({})}>Click to Update</button>
    </div>
  );
};
```

This will prevent the `ChildComponent` to rerender based on Parent rerender as it's memoized by the `useMemo`.

3. Using state with `useRef` hook.

`useRef` does not trigger a rerender when it values changes. So we can move the state to a ref.

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