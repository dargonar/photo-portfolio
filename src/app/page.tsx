import { Carousel } from "@/components/Carousel";
import { Splash } from "@/components/Splash";
import WorkGrid from "@/components/WorkGrid";

export default function HomePage() {
  return (
    <>
      <Splash />
      {/* Home scrolleable: carousel 100vh + grilla de work debajo */}
      <Carousel />
      <div className="px-4 py-8">
        <WorkGrid cols={2} />
      </div>
    </>
  );
}
