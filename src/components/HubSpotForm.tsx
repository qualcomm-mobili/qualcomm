import styles from "./HubSpotForm.module.css";

type Field = { name: string; label: string; type: string };

/**
 * Réplica VISUAL del formulario embebido de HubSpot del CTA global. No envía nada
 * (por ahora ningún formulario funciona); el submit se bloquea.
 */
export function HubSpotForm({ fields, submit }: { fields: Field[]; submit: string }) {
  return (
    <form className={styles.form} action="#" aria-label="Formulario de contacto (inactivo)">
      {fields.map((f) => (
        <div key={f.name} className={styles.field}>
          <label htmlFor={`hs-${f.name}`} className={styles.label}>
            {f.label}
            <span className={styles.required}>*</span>
          </label>
          {f.type === "textarea" ? (
            <textarea id={`hs-${f.name}`} name={f.name} className={`${styles.input} ${styles.textarea}`} />
          ) : (
            <input id={`hs-${f.name}`} name={f.name} type={f.type} className={styles.input} />
          )}
        </div>
      ))}
      <div className={styles.actions}>
        <button type="button" className={styles.submit}>
          {submit}
        </button>
      </div>
      <p className={styles.branding}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.sprocket}>
          <circle cx="15.5" cy="14.5" r="4.2" fill="none" stroke="#ff7a59" strokeWidth="2.4" />
          <path d="M15.5 10.3V5.8M15.5 5.8a1.6 1.6 0 1 0 0-.01M12.2 17.6 6 21M4.5 3.5l8 7.2" stroke="#ff7a59" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="4.3" cy="3.3" r="1.8" fill="#ff7a59" />
          <circle cx="15.5" cy="4.2" r="1.8" fill="#ff7a59" />
          <circle cx="5.2" cy="21.4" r="1.6" fill="#ff7a59" />
        </svg>
        <span>
          <span className={styles.brandLink}>Crea tus propios formularios gratuitos</span> para generar leads desde tu sitio web.
        </span>
      </p>
    </form>
  );
}
