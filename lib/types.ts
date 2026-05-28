export type ContactInfo = {
  email: string;
  phoneHref: string;
  phoneLabel: string;
  base: string;
};

export type AssetImage = {
  src: string;
  alt: string;
};

export type ProductState = "available" | "inquiry-only" | "archived";

export type RawProduct = {
  slug: string;
  title: string;
  season: string;
  priceLabel: string;
  statusLabel: string;
  inquiryLabel: string;
  sizes: string[];
  cover: string;
  coverAlt: string;
  description: string;
  details: string;
  gallery: AssetImage[];
  styleGallery: AssetImage[];
  relatedSlugs: string[];
};

export type StorefrontProduct = {
  slug: string;
  title: string;
  season: string;
  priceLabel: string;
  statusLabel: string;
  inquiryLabel: string;
  sizes: string[];
  cover: string;
  coverAlt: string;
  description: string;
  details: string;
  gallery: AssetImage[];
  styleGallery: AssetImage[];
  relatedSlugs: string[];
  state: ProductState;
  inquiryHref: string;
  checkoutHref: string | null;
};

export type HomeData = {
  texture: string;
  heroImages: AssetImage[];
  filmstrip: AssetImage[];
  featuredSlugs: string[];
};

export type Category = {
  id: string;
  label: string;
  title: string;
  description: string;
  slugs: string[];
};

export type Look = {
  id: string;
  label: string;
  title: string;
  caption: string;
  productSlugs: string[];
  images: AssetImage[];
};

export type AboutPrinciple = {
  index: string;
  title: string;
  copy: string;
};

export type LegacySeedData = {
  contact: ContactInfo;
  home: HomeData;
  categories: Category[];
  products: RawProduct[];
  looks: Look[];
  aboutPrinciples: AboutPrinciple[];
};

export type CollectionData = {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  looks: Look[];
};

export type ShopifySeedProduct = {
  handle: string;
  title: string;
  body_html: string;
  tags: string[];
  metafields: Array<{
    namespace: string;
    key: string;
    type: string;
    value: string;
  }>;
};

export type SanityProductOverlay = {
  slug: string;
  title: string;
  season: string;
  statusLabel: string;
  priceLabel: string;
  inquiryLabel: string;
  cover: string;
  gallery: AssetImage[];
  styleGallery: AssetImage[];
  description: string;
  details: string;
  relatedSlugs: string[];
};

export type SanitySeedDocument = {
  home: HomeData;
  categories: Category[];
  looks: Look[];
  aboutPrinciples: AboutPrinciple[];
  products: SanityProductOverlay[];
};
