import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

/** Páginas con header y footer globales (plantillas Elementor #180 y #92). */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
