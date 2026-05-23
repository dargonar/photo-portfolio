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
