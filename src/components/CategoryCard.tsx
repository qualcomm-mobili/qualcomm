import Link from "next/link";
import { Button, type ButtonLink } from "./Button";
import { Img } from "./Img";
import styles from "./CategoryCard.module.css";

type Props = {
  title: string;
  text: string;
  image: string;
  imageHref: string;
  button: ButtonLink;
};

/** Tarjeta de categoría: imagen cuadrada enlazada, título en negritas, texto y botón. */
export function CategoryCard({ title, text, image, imageHref, button }: Props) {
  return (
    <article className={styles.card}>
      <Link href={imageHref} className={styles.media} aria-label={title}>
        <Img src={image} alt={title} sizes="(max-width: 767px) 70vw, (max-width: 1024px) 31vw, 367px" />
      </Link>
      <p>
        <strong>{title}</strong>
      </p>
      <p>{text}</p>
      <Button {...button} />
    </article>
  );
}
