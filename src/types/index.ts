export type CarouselTransition = "fade" | "book";
export type LightboxMode = "single" | "flipbook" | "slideshow" | "compare";

export interface ImageData {
  filename: string;
  title: string;
  description: string;
  exif_date: string;
  location: string;
  iso: number;
  aperture_f: number;
  shutter_speed: string;
  focal_mm: number;
  flash: boolean;
  editor: string;
}

/* ── Text overlay on a photo (in lightbox) ── */
export interface TextOverlay {
  text_md: string;
  position:
    | "top-left" | "top-center" | "top-right"
    | "center"
    | "bottom-left" | "bottom-center" | "bottom-right";
  class?: string;
}

/* ── Scatter word (positioned freely on a canvas) ── */
export interface ScatterWord {
  text: string;
  x: number;       // % from left
  y: number;       // % from top
  rotate?: number; // degrees
  class?: string;  // CSS class for styling
}

export interface Canvas {
  width: number;
  height: number;
}

/* ── Text slide between photos ── */
export interface TextItem {
  type: "text";
  layout: "prose" | "scatter";
  content_md?: string;
  align?: "left" | "center" | "right";
  class?: string;      // CSS class for the container
  words?: ScatterWord[];
  canvas?: Canvas;     // conceptual canvas dimensions (for aspect ratio)
}

/* ── Photo item (wraps existing ImageData) ── */
export interface PhotoItem {
  type: "photo";
  data: ImageData;
  overlays?: TextOverlay[];
  words?: ScatterWord[];
}

export type SeriesItem = PhotoItem | TextItem;

export interface Serie {
  serie_name: string;
  serie_name_es: string;
  serie_slug: string;
  year: string;
  category_slug: string;
  carousel_transition: CarouselTransition;
  show_thumbnails: boolean;
  show_lightbox_title: boolean;
  show_lightbox_footer: boolean;
  lightbox_mode?: LightboxMode;
  lightbox_autoplay_interval?: number;
  images: ImageData[];
  items?: SeriesItem[];
}

export interface CarouselImage {
  filename: string;
  serie_slug: string;
}

export interface HomeConfig {
  carousel: {
    images: CarouselImage[];
    images_mobile?: CarouselImage[];
    transition_interval_s?: number;
  };
}

export interface AboutConfig {
  title: string;
  content_text: string;
  image: string;
}

export interface WorkCategory {
  title: string;
  title_es: string;
  category_slug: string;
  description: string;
}

export interface ProjectCategory {
  title: string;
  title_es: string;
  category_slug: string;
}

export interface CategoriesConfig {
  works: WorkCategory[];
  projects: ProjectCategory;
}

export interface SiteConfig {
  series: Serie[];
  pages: {
    home: HomeConfig;
    about: AboutConfig;
  };
  categories: CategoriesConfig;
}

export type Locale = "en" | "es";