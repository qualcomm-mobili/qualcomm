import { Fragment } from "react";
import styles from "./RichText.module.css";

/**
 * Texto con formato mínimo guardado en JSON: **negritas**, saltos de línea (\n) y listas
 * (líneas que empiezan con "- "). Evita guardar HTML en los datos y usar dangerouslySetInnerHTML.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  if (!lines.some((l) => l.startsWith("- "))) return <p className={className}>{renderInline(text)}</p>;

  // Agrupa en párrafos y listas, como el HTML original (texto con <br> seguido de <ul>).
  const blocks: { list: boolean; lines: string[] }[] = [];
  for (const line of lines) {
    const list = line.startsWith("- ");
    const last = blocks.at(-1);
    if (last && last.list === list) last.lines.push(list ? line.slice(2) : line);
    else blocks.push({ list, lines: [list ? line.slice(2) : line] });
  }
  return (
    <div className={className}>
      {blocks.map((b, i) =>
        b.list ? (
          <ul key={i} className={styles.list}>
            {b.lines.map((l, j) => (
              <li key={j}>{renderInline(l)}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{renderInline(b.lines.join("\n"))}</p>
        ),
      )}
    </div>
  );
}

export function renderInline(text: string) {
  return text.split("\n").map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line.split("**").map((part, j) => (j % 2 ? <strong key={j}>{part}</strong> : part))}
    </Fragment>
  ));
}
