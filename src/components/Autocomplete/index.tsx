import { useEffect, useId, useRef, useState } from "react";
import styles from "./styles.module.css";
import { HighlightText } from "./HighlightText";

type AutocompleteProps<TData> = {
  label: string;
  placeholder?: string;
  filterOptions: (searchTerm: string) => Promise<TData[]>;
  getOptionLabel: (option: TData) => string;
  onSelect?: (option: TData) => void;
};

export function Autocomplete<TData>({
  label,
  placeholder,
  filterOptions,
  getOptionLabel,
  onSelect,
}: AutocompleteProps<TData>) {
  const id = useId();
  const [showAutocompleteList, setShowAutocompleteList] = useState(false);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [options, setOptions] = useState<TData[]>([]);

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

  const debouncedInputChange = () => {
    let timeout: number;

    return (event: React.ChangeEvent<HTMLInputElement>) => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        if (!event.target.value) {
          setOptions([]);
          return;
        }
        setLoading(true);
        const optionsData = await filterOptions(event.target.value);
        setOptions(optionsData);
        setLoading(false);
      }, 250);
    };
  };

  const optionsNotFound = !options.length && !loading;
  const showLoading = loading && !options.length;

  return (
    <div className={styles.autocompleteWrapper}>
      <label htmlFor={`input-${id}`}>{label}</label>
      <input
        className={styles.autocompleteInput}
        ref={inputRef}
        id={`input-${id}`}
        type="text"
        onFocus={() => {
          setShowAutocompleteList(true);
        }}
        placeholder={placeholder}
        onChange={debouncedInputChange()}
      />

      {showAutocompleteList && (
        <ul
          className={styles.autocompleteList}
          ref={listRef}
          data-testid="autocomplete-list"
        >
          {optionsNotFound && (
            <li className={styles.autocompleteListPlaceholder}>
              No options found...
            </li>
          )}
          {showLoading && (
            <li className={styles.autocompleteListPlaceholder}>Loading...</li>
          )}

          {options.map((option) => {
            const optionLabel = getOptionLabel(option);
            return (
              <li key={optionLabel}>
                <button
                  type="button"
                  onClick={() => {
                    if (inputRef.current) {
                      inputRef.current.value = optionLabel;
                    }
                    onSelect?.(option);
                    setShowAutocompleteList(false);
                  }}
                >
                  <HighlightText
                    text={optionLabel}
                    highlight={inputRef.current?.value}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
