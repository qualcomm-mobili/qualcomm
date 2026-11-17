"use client";

import { useState } from "react";
import Image from "next/image";
import site from "@/content/site.json";
import styles from "./WhatsAppWidget.module.css";

const WA_PATH =
  "M16.04 4C9.4 4 4 9.38 4 16c0 2.12.56 4.18 1.6 6L4 28l6.2-1.62A12 12 0 0 0 16.04 28C22.66 28 28 22.62 28 16S22.66 4 16.04 4Zm0 21.8c-1.8 0-3.56-.48-5.1-1.4l-.36-.22-3.68.96.98-3.58-.24-.38A9.78 9.78 0 0 1 6.2 16c0-5.42 4.42-9.8 9.84-9.8 5.4 0 9.8 4.38 9.8 9.8 0 5.4-4.4 9.8-9.8 9.8Zm5.38-7.34c-.3-.14-1.74-.86-2-.96-.28-.1-.48-.14-.68.14-.2.3-.78.96-.96 1.16-.18.2-.36.22-.66.08-.3-.14-1.24-.46-2.36-1.46-.88-.78-1.46-1.74-1.64-2.04-.16-.3 0-.46.14-.6.12-.14.3-.36.44-.52.14-.18.2-.3.3-.5.1-.2.04-.38-.02-.52-.08-.14-.68-1.62-.92-2.22-.24-.58-.5-.5-.68-.5h-.58c-.2 0-.52.08-.8.38-.26.3-1.04 1.02-1.04 2.48s1.06 2.88 1.22 3.08c.14.2 2.08 3.18 5.04 4.46.7.3 1.26.48 1.68.62.7.22 1.36.2 1.86.12.58-.08 1.74-.7 2-1.4.24-.68.24-1.26.16-1.4-.06-.12-.26-.2-.56-.34Z";

/**
 * Réplica visual del widget flotante de WhatsApp (tochat.be). En el original aparece
 * desplegado al cargar; la X lo pliega al botón redondo. No abre WhatsApp todavía.
 */
export function WhatsAppWidget() {
  const [open, setOpen] = useState(true);
  const wa = site.whatsapp;
  return (
    <div className={styles.widget} data-floating-widget>
      {open && (
        <div className={styles.card}>
          <div className={styles.header}>
            <Image src={wa.icon} alt="" width={42} height={42} className={styles.headerIcon} />
            <p className={styles.intro}>{wa.headline}</p>
          </div>
          <div className={styles.person}>
            <Image src={wa.avatar} alt="" width={50} height={50} className={styles.avatar} />
            <div className={styles.data}>
              <p className={styles.name}>{wa.agent}</p>
              <div className={styles.info}>
                <span className={styles.status}>
                  <span className={styles.dot} />
                  {wa.status}
                </span>
                <span className={styles.tag}>{wa.channel}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        className={styles.button}
        aria-label={open ? "Cerrar WhatsApp" : "Abrir WhatsApp"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.close}>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 32 32" aria-hidden="true" className={styles.icon}>
            <path d={WA_PATH} fill="#fff" />
          </svg>
        )}
      </button>
    </div>
  );
}
