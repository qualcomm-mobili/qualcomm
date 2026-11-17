import Image, { type ImageProps } from "next/image";
import media from "@/content/media.json";

const sizes: Record<string, number[]> = media;

type Props = Omit<ImageProps, "src" | "width" | "height" | "alt"> & {
  src: string;
  alt?: string;
};

/**
 * next/image para medios locales de /public: toma ancho/alto de src/content/media.json
 * (generado con `pnpm media:manifest`), así el contenido en JSON solo guarda la ruta.
 */
export function Img({ src, alt = "", fill, ...rest }: Props) {
  if (fill) return <Image src={src} alt={alt} fill {...rest} />;
  const dims = sizes[src];
  if (!dims) throw new Error(`Imagen sin dimensiones en media.json: ${src}`);
  return <Image src={src} alt={alt} width={dims[0]} height={dims[1]} {...rest} />;
}
