import { Autocomplete } from "./components/Autocomplete";
import "./app.css";

function App() {
  return (
    <div className="app">
      <div>
        <h1>Autocomplete</h1>

        <Autocomplete label="Search users" />
      </div>
    </div>
  );
}

export default App;
