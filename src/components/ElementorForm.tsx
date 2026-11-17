import styles from "./ElementorForm.module.css";

export type FormField = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  /** "half": dos campos por fila desde tablet; en móvil siempre ocupa todo el ancho. */
  width?: "full" | "half";
};

/**
 * Réplica VISUAL del widget de formulario de Elementor Pro (campos grandes, etiquetas arriba,
 * botón naranja a todo lo ancho). No envía nada todavía.
 */
export function ElementorForm({ name, fields, submit }: { name: string; fields: FormField[]; submit: string }) {
  return (
    <form className={styles.form} action="#" aria-label={`${name} (inactivo)`}>
      {fields.map((f) => (
        <div key={f.name} className={`${styles.group} ${f.width === "half" ? styles.half : ""}`}>
          <label htmlFor={`ef-${f.name}`} className={`${styles.label} ${f.required ? styles.required : ""}`}>
            {f.label}
          </label>
          {f.type === "textarea" ? (
            <textarea id={`ef-${f.name}`} name={f.name} rows={4} className={styles.field} />
          ) : (
            <input id={`ef-${f.name}`} name={f.name} type={f.type} className={styles.field} />
          )}
        </div>
      ))}
      <div className={styles.group}>
        <button type="button" className={styles.submit}>
          {submit}
        </button>
      </div>
    </form>
  );
}
