"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Img } from "./Img";
import { MenuGroups, type MenuGroup } from "./MenuGroups";
import styles from "./MobileMenu.module.css";

/** Menú overlay de tablet/móvil (popup Elementor #210): panel blanco que entra desde la derecha. */
export function MobileMenu({ icon, groups }: { icon: string; groups: MenuGroup[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Cierra al navegar.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" className={styles.toggle} aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen(true)}>
        <Img src={icon} alt="" />
      </button>
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Menú" onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.close} aria-label="Cerrar menú" onClick={() => setOpen(false)}>
              {/* eicon-close de Elementor */}
              <svg viewBox="0 0 1000 1000" aria-hidden="true">
                <path d="M742 167L500 408 258 167C246 154 233 150 217 150 196 150 179 158 167 167 154 179 150 196 150 212 150 229 154 242 171 254L408 500 167 742C138 771 138 800 167 829 196 858 225 858 254 829L496 587 738 829C750 842 767 846 783 846 800 846 817 842 829 829 842 817 846 804 846 783 846 767 842 750 829 737L588 500 833 258C863 229 863 200 833 171 804 137 775 137 742 167Z" />
              </svg>
            </button>
            <div className={styles.groups}>
              <MenuGroups groups={groups} variant="menu" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
