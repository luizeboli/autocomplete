type HighlightTextProps = {
  text: string;
  highlight?: string;
};

export function HighlightText({ text, highlight }: HighlightTextProps) {
  if (!highlight) return <span>{text}</span>;

  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          // Using index as the key is not ideal,
          // but let's consider the list would be completely different every search
          // eslint-disable-next-line react/no-array-index-key
          <b key={index}>{part}</b>
        ) : (
          part
        ),
      )}
    </span>
  );
}
