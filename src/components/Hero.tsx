import Link from "next/link";
import { Button, type ButtonLink } from "./Button";
import { Slideshow } from "./Slideshow";
import styles from "./Hero.module.css";

type Props = {
  title: string;
  lead?: string;
  text?: string;
  button?: ButtonLink;
  note?: { text: string; link: ButtonLink };
  slideshow: string[];
  slideDurationMs: number;
};

/** Hero con degradado crema→arena, texto a la izquierda y slideshow (Ken Burns) a la derecha que sobresale hacia abajo. */
export function Hero({ title, lead, text, button, note, slideshow, slideDurationMs }: Props) {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          {lead && (
            <p className={styles.lead}>
              <strong>{lead}</strong>
            </p>
          )}
          {text && <p>{text}</p>}
          {button && <Button {...button} />}
          {note && (
            <p className={styles.note}>
              {note.text} <Link href={note.link.href}>{note.link.label}</Link>
            </p>
          )}
        </div>
        <Slideshow
          images={slideshow}
          slideMs={slideDurationMs}
          kenBurns
          priority
          sizes="(max-width: 1024px) 95vw, 570px"
          className={styles.media}
        />
      </div>
    </section>
  );
}
