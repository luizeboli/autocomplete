import { useState } from "react";
import { Autocomplete } from "./components/Autocomplete";
import { User } from "./types";
import "./app.css";

function App() {
  const [, setSelected] = useState<User>();

  return (
    <div className="app">
      <div>
        <h1>Autocomplete</h1>

        <Autocomplete
          label="Search users"
          placeholder="Start typing to search for users"
          filterOptions={async (searchTerm) => {
            // We are hardcoding the API URL here, but in a real world scenario
            // we would probably have a service helper to handle this
            // With the value coming from an environment variable
            const response = await fetch(
              "https://jsonplaceholder.typicode.com/users",
            );
            const data = (await response.json()) as User[];

            // In a real world scenario the API would probably search considering a "like" statement
            // This is not true for the fake API we're using here, so we need to filter the results ourselves
            return data.filter((user) =>
              user.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()),
            );
          }}
          getOptionLabel={(user) => user.name}
          onSelect={(user) => {
            setSelected(user);
          }}
        />
      </div>
    </div>
  );
}

export default App;
