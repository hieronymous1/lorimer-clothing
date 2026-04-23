const toggle = document.querySelector("[data-menu-toggle]");
const panel = document.querySelector("[data-mobile-panel]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (toggle && panel) {
  const closeMenu = () => {
    panel.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
  };

  toggle.addEventListener("click", () => {
    const open = panel.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Close" : "Menu";
  });

  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("is-open")) {
      closeMenu();
    }
  });
}

const homeToolbar = document.querySelector("[data-home-toolbar]");
const isHomePage = document.body?.dataset.page === "home";

if (isHomePage && homeToolbar && homeToolbar.dataset.toolbarMode !== "static") {
  let lastY = window.scrollY;
  const offset = 16;

  const handleScroll = () => {
    const currentY = window.scrollY;
    const goingDown = currentY > lastY;

    if (goingDown && currentY > offset) {
      homeToolbar.classList.add("is-hidden");
    } else {
      homeToolbar.classList.remove("is-hidden");
    }

    lastY = currentY;
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
}

const leftSequence = document.querySelector("[data-home-sequence-left] img");
const rightSequence = document.querySelector("[data-home-sequence-right] img");

const homeLeftImages = [
  "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/BomberJacket.FIT3.V6.png",
  "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/ReconShirt1.Flat.jpeg",
  "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Vest.Black.FIT1.png",
  "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Trousers.FIT4.jpeg"
];

const homeRightImages = [
  "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Top.FIT5.jpeg",
  "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Skirt.FIT5V2.jpeg",
  "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Skirt.FIT5.jpeg",
  "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Trousers.FIT1.png"
];

if (isHomePage && leftSequence && rightSequence) {
  let imageIndex = 0;
  let sequenceTimer;
  const fadeDelay = prefersReducedMotion ? 0 : 180;
  const sequenceDelay = prefersReducedMotion ? 6400 : 2600;
  const updateSequence = () => {
    imageIndex = (imageIndex + 1) % homeLeftImages.length;
    leftSequence.classList.add("is-fading");
    rightSequence.classList.add("is-fading");

    window.setTimeout(() => {
      leftSequence.src = homeLeftImages[imageIndex];
      rightSequence.src = homeRightImages[imageIndex];
      leftSequence.classList.remove("is-fading");
      rightSequence.classList.remove("is-fading");
    }, fadeDelay);
  };

  const startSequence = () => {
    if (!sequenceTimer) {
      sequenceTimer = window.setInterval(updateSequence, sequenceDelay);
    }
  };

  const stopSequence = () => {
    if (sequenceTimer) {
      window.clearInterval(sequenceTimer);
      sequenceTimer = undefined;
    }
  };

  startSequence();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopSequence();
      return;
    }
    startSequence();
  });
}

const lookGalleries = document.querySelectorAll("[data-look-gallery]");

lookGalleries.forEach((gallery) => {
  const image = gallery.querySelector("[data-gallery-image]");
  const controls = gallery.querySelector("[data-gallery-controls]");
  const prevButton = gallery.querySelector("[data-gallery-prev]");
  const nextButton = gallery.querySelector("[data-gallery-next]");
  const sources = (gallery.dataset.images || "")
    .split("|")
    .map((src) => src.trim())
    .filter(Boolean);

  if (!image || sources.length === 0) {
    return;
  }

  let currentIndex = 0;
  const altBase = gallery.dataset.alt || image.alt || "S/S24 look image";

  const updateImage = () => {
    image.classList.add("is-fading");

    window.setTimeout(() => {
      image.src = sources[currentIndex];
      image.alt = `${altBase} ${currentIndex + 1}`;
      image.classList.remove("is-fading");
    }, prefersReducedMotion ? 0 : 140);
  };

  if (sources.length < 2) {
    if (controls) {
      controls.hidden = true;
    }
    return;
  }

  if (controls) {
    controls.hidden = false;
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + sources.length) % sources.length;
      updateImage();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % sources.length;
      updateImage();
    });
  }
});

const productCatalog = {
  "university-striped-sweatshirt": {
    season: "S/S24 / Men",
    title: "University Striped Sweatshirt",
    image: "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/UOLSweater.FIT2.jpeg",
    alt: "University striped sweatshirt",
    intro: "A clean collegiate stripe reworked into a quieter silhouette for the Lorimer product study.",
    details: "Rib trim at neck, cuff, and hem keeps the body precise while preserving soft volume.",
    fit: "Relaxed straight fit with a controlled shoulder line.",
    composition: "Cotton-heavy jersey blend with compact surface texture.",
    price: "Price on request",
    note: "Inquiries are handled directly through the studio.",
    images: [
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/UOLSweater.FIT2.jpeg",
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Trousers.FIT3.jpeg"
    ]
  },
  "reconstructed-bomber-jacket": {
    season: "S/S24 / Men",
    title: "Reconstructed Bomber Jacket",
    image: "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/BomberJacket.FIT3.V3.png",
    alt: "Reconstructed bomber jacket",
    intro: "A cropped bomber built through panel reconstruction and tonal contrast.",
    details: "Segmented body panels and compact sleeve volume keep the garment architectural without excess.",
    fit: "Boxy cropped profile with a shorter body length and relaxed arm.",
    composition: "Mixed denim and leather with tonal hardware accents.",
    price: "Price on request",
    note: "Produced in limited quantities.",
    images: [
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/BomberJacket.FIT3.V3.png",
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/BomberJacket.FIT3V5.png",
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/BomberJacket.FIT3.V6.png",
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/BomberJacket.FIT3V4.jpeg"
    ]
  },
  "pinstriped-trouser": {
    season: "S/S24 / Men",
    title: "Pinstriped Trouser",
    image: "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Pinstripe.Trouser.V1.png",
    alt: "Pinstriped trouser",
    intro: "Tailored pinstripe reduced to a calm straight-line trouser.",
    details: "Pressed front line, clean waistband construction, and subtle pocket finishing.",
    fit: "Straight leg with moderate rise and light break at hem.",
    composition: "Wool blend suiting with fine stripe structure.",
    price: "Price on request",
    note: "Sizing support is available on request.",
    images: [
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Pinstripe.Trouser.V1.png",
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Trousers.FIT3V2.png"
    ]
  },
  "layered-texture-skirt": {
    season: "S/S24 / Women",
    title: "Layered Texture Skirt",
    image: "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Skirt.FITV3.png",
    alt: "Layered texture skirt",
    intro: "An asymmetrical texture study where movement comes from layering.",
    details: "Panel layering and directional seams create depth while keeping the silhouette clean.",
    fit: "High-waisted profile with structured drape around the hip.",
    composition: "Cotton and technical blend with textured face.",
    price: "Price on request",
    note: "Available through direct studio contact.",
    images: [
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Skirt.FITV3.png",
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Skirt.FIT5V2.jpeg",
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Skirt.FIT5.jpeg"
    ]
  },
  "ss24-dress": {
    season: "S/S24 / Women",
    title: "S/S24 Dress",
    image: "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Dresss.jpeg",
    alt: "S/S24 dress",
    intro: "A single-line dress with quiet structure and elongated proportion.",
    details: "Minimal seam language and restrained shaping keep focus on line and fall.",
    fit: "Long vertical silhouette with easy movement through the lower body.",
    composition: "Soft drape woven fabric with matte finish.",
    price: "Price on request",
    note: "Styling and fit guidance is available on request.",
    images: [
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Dresss.jpeg",
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Dress.FIT6.jpeg"
    ]
  },
  "asymmetrical-top": {
    season: "S/S24 / Women",
    title: "Asymmetrical Top",
    image: "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Top.FIT5.jpeg",
    alt: "Asymmetrical top",
    intro: "A directional top balancing sharp cut lines with a soft stance.",
    details: "Offset hem and clean neckline geometry define the piece without extra surface treatment.",
    fit: "Close shoulder with controlled ease through body.",
    composition: "Lightweight woven blend with crisp hand.",
    price: "Price on request",
    note: "Designed for layered pairings within S/S24.",
    images: [
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Top.FIT5.jpeg",
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Top.FIT4.jpeg"
    ]
  },
  "dual-texture-knit-vest": {
    season: "S/S24 / Capsule",
    title: "Dual Texture Knit Vest",
    image: "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Vest.FIT1V2.png",
    alt: "Dual texture knit vest",
    intro: "A layered knit object combining two surface densities in one compact form.",
    details: "Contrasted knit panels frame the torso while preserving a minimal edge finish.",
    fit: "Regular fit with slight boxy volume through body.",
    composition: "Dual-gauge knit cotton blend.",
    price: "Price on request",
    note: "Built to layer with shirting or standalone.",
    images: [
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Vest.FIT1V2.png",
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Vest.Black.FIT1.png"
    ]
  },
  "reconstructed-button-up-002": {
    season: "S/S24 / Capsule",
    title: "Reconstructed Button Up 002",
    image: "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/ReconShirt2.Flat.jpeg",
    alt: "Reconstructed button up 002",
    intro: "A shirt form rebuilt through panel logic with a restrained formal register.",
    details: "Directional seam placements and precise collar proportion structure the garment.",
    fit: "Relaxed shirt block with a slightly elongated body.",
    composition: "Cotton shirting with mixed panel weights.",
    price: "Price on request",
    note: "Limited run.",
    images: [
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/ReconShirt2.Flat.jpeg",
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/ReconShirt2.Flat.Back.jpeg"
    ]
  },
  "adjustable-button-trousers": {
    season: "S/S24 / Capsule",
    title: "Adjustable Button Trousers",
    image: "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Trousers.FIT1.png",
    alt: "Adjustable button trousers",
    intro: "A modular trouser with button-based adjustment points and a restrained tailored base.",
    details: "Functional side buttoning allows subtle volume and break variation across styling contexts.",
    fit: "Straight cut with adjustable side shaping.",
    composition: "Structured cotton blend twill.",
    price: "Price on request",
    note: "Adjustment system is demonstrated during fitting appointments.",
    images: [
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Trousers.FIT1.png",
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Trousers.FIT1.V2.jpeg",
      "../wetransfer_lorimer-web-template-for-product-and-s-s24-page-product-flat-photos_2026-02-12_1803/AAGarmentFlats/Trousers.FIT4.jpeg"
    ]
  }
};

const productDetailPage = document.querySelector("[data-product-detail-page]");

if (productDetailPage) {
  const params = new URLSearchParams(window.location.search);
  const requestedSlug = params.get("slug");
  const fallbackSlug = Object.keys(productCatalog)[0];
  const activeSlug = requestedSlug && productCatalog[requestedSlug] ? requestedSlug : fallbackSlug;
  const product = productCatalog[activeSlug];

  const titleNode = productDetailPage.querySelector("[data-product-title]");
  const seasonNode = productDetailPage.querySelector("[data-product-season]");
  const introNode = productDetailPage.querySelector("[data-product-intro]");
  const detailsNode = productDetailPage.querySelector("[data-product-details]");
  const fitNode = productDetailPage.querySelector("[data-product-fit]");
  const compositionNode = productDetailPage.querySelector("[data-product-composition]");
  const priceNode = productDetailPage.querySelector("[data-product-price]");
  const noteNode = productDetailPage.querySelector("[data-product-note]");
  const galleryNode = productDetailPage.querySelector("[data-product-gallery]");

  if (titleNode) {
    titleNode.textContent = product.title;
  }
  if (seasonNode) {
    seasonNode.textContent = product.season;
  }
  if (introNode) {
    introNode.textContent = product.intro;
  }
  if (detailsNode) {
    detailsNode.textContent = product.details;
  }
  if (fitNode) {
    fitNode.textContent = product.fit;
  }
  if (compositionNode) {
    compositionNode.textContent = product.composition;
  }
  if (priceNode) {
    priceNode.textContent = product.price;
  }
  if (noteNode) {
    noteNode.textContent = product.note;
  }
  if (galleryNode) {
    const galleryImages = Array.isArray(product.images) && product.images.length ? product.images : [product.image];
    galleryNode.innerHTML = galleryImages
      .map((src, index) => {
        const priority = index === 0 ? ' fetchpriority="high"' : "";
        return `<img src="${src}" alt="${product.alt} ${index + 1}"${priority} decoding="async" loading="${index === 0 ? "eager" : "lazy"}">`;
      })
      .join("");
  }

  const sizeOptions = productDetailPage.querySelectorAll(".product-size-option");
  sizeOptions.forEach((button) => {
    button.addEventListener("click", () => {
      sizeOptions.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
    });
  });

  document.title = `LORIMER ${product.title}`;
}
