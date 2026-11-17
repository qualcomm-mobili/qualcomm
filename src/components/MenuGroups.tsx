import Link from "next/link";
import styles from "./MenuGroups.module.css";

export type MenuGroup = { title: string; links: { label: string; href: string; external?: boolean }[] };

/** Grupos de enlaces (Qualcomm / Catálogo / Contacto) compartidos por el menú overlay y el footer. */
export function MenuGroups({ groups, variant }: { groups: MenuGroup[]; variant: "menu" | "footer" }) {
  return (
    <>
      {groups.map((g) => (
        <div key={g.title} className={`${styles.group} ${styles[variant]}`}>
          <p className={styles.title}>{g.title}</p>
          <ul className={styles.list}>
            {g.links.map((l) => (
              <li key={l.href}>
                {l.external ? (
                  <a href={l.href} target="_blank">
                    {l.label}
                  </a>
                ) : (
                  <Link href={l.href}>{l.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
