import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Autocomplete } from ".";
import { textContentMatcher } from "../../tests/utils";

describe("<Autocomplete />", () => {
  it("should open the list when input has focus and only close it when clicking outside", async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <>
        <Autocomplete
          label="Search for users"
          filterOptions={() => Promise.resolve([{ id: 1 }])}
          getOptionLabel={(option) => option.id.toString()}
        />
        <button type="button" data-testid="outside-button">
          Outside
        </button>
      </>,
    );

    // Act
    await user.click(screen.getByLabelText("Search for users"));
    expect(screen.getByTestId("autocomplete-list")).toBeInTheDocument();
    await user.click(screen.getByTestId("autocomplete-list"));
    expect(screen.getByTestId("autocomplete-list")).toBeInTheDocument();
    await user.click(screen.getByTestId("outside-button"));

    // Assert
    expect(screen.queryByTestId("autocomplete-list")).not.toBeInTheDocument();
  });

  it("should show no options text when opening the list", async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <Autocomplete
        label="Search for users"
        filterOptions={() => Promise.resolve([{ id: 1 }])}
        getOptionLabel={(option) => option.id.toString()}
      />,
    );

    // Act
    await user.click(screen.getByLabelText("Search for users"));

    // Assert
    expect(screen.getByText(/no options found/i)).toBeInTheDocument();
  });

  it("should show loading state when user is typing and theres no previous options", async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <Autocomplete
        label="Search for users"
        filterOptions={(): Promise<{ name: string }[]> =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve([{ name: "Fake 1" }, { name: "Fake 2" }]);
            }, 100);
          })
        }
        getOptionLabel={(option) => option.name}
      />,
    );

    // Act
    await user.type(screen.getByLabelText("Search for users"), "1");

    // Assert
    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  it("should search for options when user types", async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <Autocomplete
        label="Search for users"
        filterOptions={(): Promise<{ name: string }[]> =>
          new Promise((resolve) => {
            resolve([{ name: "Fake 1" }, { name: "Fake 2" }]);
          })
        }
        getOptionLabel={(option) => option.name}
      />,
    );

    // Act
    await user.type(screen.getByLabelText("Search for users"), "Fake");

    // Assert
    expect(
      await screen.findByText(textContentMatcher(/fake 1/i)),
    ).toBeInTheDocument();
    expect(screen.getByText(textContentMatcher(/fake 2/i))).toBeInTheDocument();
  });

  it("should highlight matching parts of the option label when user types", async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <Autocomplete
        label="Search for users"
        filterOptions={(): Promise<{ name: string }[]> =>
          new Promise((resolve) => {
            resolve([
              { name: "Fake 1" },
              { name: "Fake 2" },
              { name: "Another Random" },
            ]);
          })
        }
        getOptionLabel={(option) => option.name}
      />,
    );

    // Act
    await user.type(screen.getByLabelText("Search for users"), "Fake");

    // Assert
    const firstHighlightedTextContent = within(
      await screen.findByText(textContentMatcher(/fake 1/i)),
    ).getByTestId("highlighted-text").textContent;
    expect(firstHighlightedTextContent).toBe("Fake");

    const secondHighlightedTextContent = within(
      screen.getByText(textContentMatcher(/fake 1/i)),
    ).getByTestId("highlighted-text").textContent;
    expect(secondHighlightedTextContent).toBe("Fake");

    const elementWithoutHighlight = screen.getByText(
      textContentMatcher(/Another Random/i),
    );
    expect(
      within(elementWithoutHighlight).queryByTestId("highlighted-text"),
    ).not.toBeInTheDocument();
  });
});
