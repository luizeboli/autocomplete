import { useEffect, useId, useRef, useState } from "react";
import styles from "./styles.module.css";

type AutocompleteProps = {
  label: string;
};

export function Autocomplete({ label }: AutocompleteProps) {
  const id = useId();
  const [showAutocompleteList, setShowAutocompleteList] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showAutocompleteList) return;

    const handleHideAutocompleteList = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        listRef.current?.contains(target) ||
        inputRef.current?.contains(target)
      )
        return;
      setShowAutocompleteList(false);
    };

    window.addEventListener("click", handleHideAutocompleteList);

    return () => {
      window.removeEventListener("click", handleHideAutocompleteList);
    };
  }, [showAutocompleteList]);

  return (
    <div className={styles.autocompleteWrapper}>
      <label htmlFor={`input-${id}`}>{label}</label>
      <input
        ref={inputRef}
        id={`input-${id}`}
        type="text"
        onFocus={() => {
          setShowAutocompleteList(true);
        }}
      />

      <ul
        className={styles.autocompleteList}
        hidden={!showAutocompleteList}
        ref={listRef}
      >
        <li>Mock 1</li>
        <li>Mock 2</li>
        <li>Mock 3</li>
      </ul>
    </div>
  );
}
