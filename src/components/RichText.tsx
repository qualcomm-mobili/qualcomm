import { Fragment } from "react";

/**
 * Párrafo con formato mínimo guardado en JSON: **negritas** y saltos de línea (\n).
 * Evita guardar HTML en los datos y usar dangerouslySetInnerHTML.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  return <p className={className}>{renderInline(text)}</p>;
}

export function renderInline(text: string) {
  return text.split("\n").map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line.split("**").map((part, j) => (j % 2 ? <strong key={j}>{part}</strong> : part))}
    </Fragment>
  ));
}
