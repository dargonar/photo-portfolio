import { Carousel } from "@/components/Carousel";
import { Splash } from "@/components/Splash";
import WorkGrid from "@/components/WorkGrid";

export default function HomePage() {
  return (
    <>
      <Splash />
      {/* Home scrolleable: carousel 100vh + grilla de work debajo */}
      <Carousel />
      {/* La grilla scrollea por encima del carousel (sticky) — fondo opaco para taparlo */}
      <div className="relative z-10 bg-background px-4 pt-8 pb-24">
        <WorkGrid cols={2} />
      </div>
    </>
  );
}
