import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const sourcePath = path.join(root, "site", "data.js");
const outputDir = path.join(root, "generated", "seed");

const source = await fs.readFile(sourcePath, "utf8");
const sandbox = { window: {} };

vm.runInNewContext(source, sandbox, { filename: "site/data.js" });

const data = sandbox.window.LORIMER_DATA;

if (!data) {
  throw new Error("Unable to load legacy seed data.");
}

const shopifyProducts = data.products.map((product) => ({
  handle: product.slug,
  title: product.title,
  body_html: product.description,
  tags: [product.season, product.statusLabel],
  metafields: [
    { namespace: "lorimer", key: "details", type: "single_line_text_field", value: product.details },
    { namespace: "lorimer", key: "sizes", type: "json", value: JSON.stringify(product.sizes) },
    { namespace: "lorimer", key: "related_slugs", type: "json", value: JSON.stringify(product.relatedSlugs) }
  ]
}));

const sanitySeed = {
  home: data.home,
  categories: data.categories,
  looks: data.looks,
  aboutPrinciples: data.aboutPrinciples,
  products: data.products.map((product) => ({
    slug: product.slug,
    title: product.title,
    season: product.season,
    statusLabel: product.statusLabel,
    priceLabel: product.priceLabel,
    inquiryLabel: product.inquiryLabel,
    cover: product.cover,
    gallery: product.gallery,
    styleGallery: product.styleGallery,
    description: product.description,
    details: product.details,
    relatedSlugs: product.relatedSlugs
  }))
};

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(
  path.join(outputDir, "shopify-products.json"),
  JSON.stringify(shopifyProducts, null, 2)
);
await fs.writeFile(
  path.join(outputDir, "sanity-seed.json"),
  JSON.stringify(sanitySeed, null, 2)
);

console.log(`Seed files written to ${outputDir}`);
