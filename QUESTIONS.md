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

# 5. What is a fragment and why do we need it? Give an example where it might break my app.

A fragment is an empty React component that does not add additional tags to the markup.

JSX is not HTML, so when we use "html tags" like `<div />` in a component we are actually using "jsx tags". This means these tags will be converted to an array of objects to represent the components tree.

Because of that we cannot return multiple components without an ancestor:

```jsx
const Component = () => {
  return (
    <div />
    <div />
  )
}
```

This would be the same as returning multiple objects without wrapping them in an array:

```javascript
function() {
  return { id: 1 }, { id: 2}
}
```

We must then wrap the components in a fragment, this is useful when we don't want to create additional tags. The shorthand syntax for fragment is `<>`:

```jsx
const Component = () => {
  return (
    <>
      <div />
      <div />
    </>
  )
}
```

We can use fragments anywhere we can use a normal component, including lists, and this can break the app if we don't pass a key to the fragment. We also can't pass key to the shorthand syntax, we must use the `<React.Fragment>` syntax.

Why the absence of a key can break the app?

When rendering lists React uses the key to track the current position of the element and optimize updates to the tree based on the elements that has changed. So when we don't pass a key unexpected behaviors that may be hard to debug happens, like rendering the content of an element in the wrong position. React adopts a similar solution when dealing with hooks, that's why we can't render hooks in conditional statements like `if`, they must always be in the same execution position.

```jsx
const Component = () => {
  const array = [1,2,3]

  return array.map(item => (
    <React.Fragment key={item}>
      {item}
    </React.Fragment>
  ))
}
```

# 6. Give 3 examples of the HOC pattern.

HOC (high order component) is a common pattern used in React class components to add behavior, functionalities or just inject props in a given component. Nowadays we can do the same with custom hooks.

The first example is an authentication HOC

```jsx
const withAuthentication = (WrappedComponent) => {
  class WithAuthentication extends React.Component {
    
    // Check authentication status and perform necessary actions like redirecting to the login page
    // ...

    render() {
      if (authenticated) {
        return <WrappedComponent user={this.currentUser} />;
      } else {
        return <Spinner />;
      }
    }
  }
  
  return WithAuthentication;
};
```

We can use it like so:

```jsx
const ProtectedComponent = withAuthentication(Component);
```

If the user is not authenticated then the contents of the components is not rendered.

The second example is a component that adds an event listener to the `resize` event, so it can inject the current window size to a given component

```jsx
const withWindowSize = (WrappedComponent) => {
  class withWindowSize extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
    
    componentDidMount() {
      window.addEventListener('resize', this.handleResize);
    }
    
    componentWillUnmount() {
      window.removeEventListener('resize', this.handleResize);
    }
    
    handleResize = () => {
      this.setState({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    render() {
      const { width, height } = this.state;
      
      return (
        <WrappedComponent width={width} height={height} {...this.props} />
      );
    }
  }
  
  return withWindowSize;
};
```

We can use it like so:

```jsx
const Component = ({ width, height }) => {
  // ...
};

const WindowSizeComponent = withResize(Component);
```

The last example is kind of an Error Boundary, so we can render an error fallback and do additional actions like logging into Sentry or other service. Not to mention, an Error Boundary is implemented using the `componentDidCatch` lifecycle method.

```jsx
const withErrorBoundary = (WrappedComponent) => {
  class withErrorBoundary extends React.Component {
    state = {
      hasError: false,
      error: null
    };
    
    componentDidCatch(error, info) {
      this.setState({
        hasError: true,
        error
      }); 
    }
    
    render() {
      const { hasError, error } = this.state;
      
      if (hasError) {
        return <ErrorComponent error={error} />;
      }
      
      return <WrappedComponent {...this.props} />;
    }
  }
  
  return withErrorBoundary;
};
```

We can use it like so:

```jsx
const ComponentWithError = withErrorBoundary(Component);
```

# 7. What's the difference in handling exceptions in promises, callbacks and async...await?

You can pretty much achieve the same results using promises, callbacks and async/await. The difference is that callbacks are the most primitive way of dealing with async. You should manually check for the error and the data inside the callback, as an argument, and they can end up being in the famous callback hell problem.

With Promises you can take advantage of the `then` and `catch` chainable methods, if any exception happen in the Promise chain it will execute the first `.catch` method after the exception. You can also chain the `then` and `catch` methods. Promises also have the `finally` that is executed when the promise is either resolved or rejected.

Using promises you can better handle async by having a native way of dealing with exceptions and reducing callback hell.

```javascript
await Promise.resolve()
  .then(() => 
    ({ id: 1})
  )
  .then(data => {
    // this will be { id: 1 }
  })

// If an exception is thrown then only the .catch will be executed
await Promise.reject()
  .then(() => 
    ({ id: 1})
  )
  .catch((error) => {
    // The 'error' parameter will contain the thrown exception
  })

// We can also use a '.then' after a '.catch'
await Promise.reject()
  .then(() => 
    ({ id: 1})
  )
  .catch((error) => {
    // The 'error' parameter will contain the thrown exception
  })
  .then(() => {
    // This will be executed with the return from the above `.catch`
  })
```

Talking about async/await, it's basically a syntax sugar on top of the Promise object (I have an post that talks about that [here](https://js.felicio.dev/asyncawait)), so we can use a `try/catch` block to deal with exception.

```javascript
try {
  const response = await promise()
} catch(error) {
  // If anything throws an exception in the try block, then the catch block will be executed with the error as an argument
}
```

# 8. How many arguments does setState take and why is it async.

In the class version of a React component, the `setState` method accepts two arguments. The first one is the next state that can be either an object, string, etc. or a callback that receives the previous state as argument. The second one is a callback that will be executed after the state is updated.

In the hooks version, the `setState` from `useState` accepts only one argument, in the same rules as the class version. It can be the raw next state, like an object, array, string, etc.. Or a callback that receives the previous state as argument.

The `setState` method is async because it causes the component to rerender which can be an expensive computation.

Also, `setState` is not async in the form of a Promise, that we can `await` or `.then`, instead, when calling `setState` what React does is append this update request to a queue that will be later executed.

# 9. List the steps needed to migrate a Class to Function Component.

Honestly I don't know if there's a way to migrate from Class to Function by doing small changes that doesn't break the component in the first save, lol.

I did a huge migration in an application at my current job, from class to functional, basically following these steps:

> First of all, I would like to write some tests to cover the component functionalities, but it's not always possible (sometimes the project does not have tests, or other weird reasons). After that:

1. Change from class declaration to function declaration;
2. Remove the constructor by moving the state initialization to the hook version;
3. Adjust the class methods declaration and refactor them to stop using `this` (state, props and other methods);
4. Remove the `render` method and just lift up the `return` statement;
5. Adjust all lifecycle methods like `componentDidMount`, `componentDidUpdate`, `componentWillUpdate`, `componentWillUnmount` to `useEffect`;
6. Implement `React.memo` if the component is a `PureComponent` or uses `shouldComponentUpdate`

If I'm not forgetting anything, that's it. Obviously some improvements opportunities might show up, like splitting the state. But I prefer to first migrate it and later check if we can do improvements.

# 10. List a few ways styles can be used with components.

1. The first way is a inline form by passing a `style` prop to the component, but doing this way we can't apply styles to pseudo elements and states, like `:before` or `:hover`

```jsx
const Component = () => {
  return (
    <div style={{ display: 'flex' }} />
  )
}
```

2. Create a css file and import it in the component

```css
/* index.css  */
.wrapper {
  display: flex;
}
```

```jsx
import './index.css'

const Component = () => {
  return (
    <div style={{ display: 'flex' }} />
  )
}
```

The problem of creating regular `.css` files is that the styles will be applied globally through the application, this means they can affect other component.

3. Create a CSS module

```css
/* index.module.css  */
.wrapper {
  display: flex;
}
```

```jsx
import './index.module.css'

const Component = () => {
  return (
    <div style={{ display: 'flex' }} />
  )
}
```

The difference from the 2. approach is that by creating a CSS module creates a local scope of styles ensuring they do not affect other components.

4. Third party libraries like styled-component, Material Ui, tailwind, etc...

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