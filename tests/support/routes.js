const archivedProduct = {
  slug: "reconstructed-bomber-jacket",
  title: "Reconstructed Leather Patchwork Bomber Jacket",
  statusLabel: "Archived / 1 of 1"
};

const smokeRoutes = [
  {
    path: "/",
    heading: "Lorimer stages clothing as an archive first and commerce second."
  },
  {
    path: "/shop",
    heading: "The catalog is staged as an authored field instead of a neutral product grid."
  },
  {
    path: "/ss24",
    heading: "S/S24 is staged as a runway archive before it behaves like a store."
  },
  {
    path: "/about",
    heading: "Lorimer treats garments as constructed documents before they are treated as products."
  },
  {
    path: `/product/${archivedProduct.slug}`,
    heading: archivedProduct.title
  }
];

module.exports = {
  archivedProduct,
  smokeRoutes
};
