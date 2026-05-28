(() => {
  const data = window.LORIMER_DATA;

  if (!data) {
    return;
  }

  const productIndex = new Map(data.products.map((product) => [product.slug, product]));
  const categoryIndex = new Map(data.categories.map((category) => [category.id, category]));
  const root = document.documentElement;

  const createImage = (src, alt, className) => {
    const image = document.createElement("img");
    image.src = src;
    image.alt = alt;
    if (className) {
      image.className = className;
    }
    image.loading = "lazy";
    image.decoding = "async";
    return image;
  };

  const setNavState = () => {
    const page = document.body.dataset.page;
    document.querySelectorAll("[data-route]").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.route === page);
    });
  };

  const setupMobileNav = () => {
    const toggle = document.querySelector("[data-menu-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    const closeMenu = () => {
      panel.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Menu";
    };

    toggle.addEventListener("click", () => {
      const next = !panel.classList.contains("is-open");
      panel.classList.toggle("is-open", next);
      toggle.setAttribute("aria-expanded", String(next));
      toggle.textContent = next ? "Close" : "Menu";
    });

    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  };

  const setContact = () => {
    document.querySelectorAll("[data-contact-email]").forEach((node) => {
      node.href = `mailto:${data.contact.email}`;
      node.textContent = data.contact.email;
    });

    document.querySelectorAll("[data-contact-phone]").forEach((node) => {
      node.href = `tel:${data.contact.phoneHref}`;
      node.textContent = data.contact.phoneLabel;
    });

    document.querySelectorAll("[data-contact-base]").forEach((node) => {
      node.textContent = data.contact.base;
    });
  };

  const renderHome = () => {
    const heroGrid = document.querySelector("[data-home-hero-grid]");
    const featuredGrid = document.querySelector("[data-home-featured-grid]");
    const filmstrip = document.querySelector("[data-home-filmstrip]");

    if (!heroGrid || !featuredGrid || !filmstrip) {
      return;
    }

    data.home.heroImages.forEach((image, index) => {
      const frame = document.createElement("figure");
      frame.className = `hero-frame hero-frame--${index + 1}`;
      frame.appendChild(createImage(image.src, image.alt, "hero-image"));
      heroGrid.appendChild(frame);
    });

    data.home.featuredSlugs
      .map((slug) => productIndex.get(slug))
      .filter(Boolean)
      .forEach((product) => {
        featuredGrid.appendChild(createProductCard(product, "featured-product-card"));
      });

    data.home.filmstrip.forEach((image) => {
      const frame = document.createElement("figure");
      frame.className = "filmstrip-frame";
      frame.appendChild(createImage(image.src, image.alt, "filmstrip-image"));
      filmstrip.appendChild(frame);
    });
  };

  const createProductCard = (product, className = "product-card") => {
    const article = document.createElement("article");
    article.className = className;

    const link = document.createElement("a");
    link.className = "product-card-link";
    link.href = `product.html?slug=${product.slug}`;
    link.setAttribute("aria-label", `Open ${product.title}`);

    const media = document.createElement("div");
    media.className = "product-card-media";
    media.appendChild(createImage(product.cover, product.coverAlt, "product-card-image"));

    const body = document.createElement("div");
    body.className = "product-card-body";
    body.innerHTML = `
      <div class="product-card-meta">${product.season}</div>
      <h3>${product.title}</h3>
      <p>${product.priceLabel}</p>
    `;

    link.append(media, body);
    article.appendChild(link);
    return article;
  };

  const renderShop = () => {
    const nav = document.querySelector("[data-shop-nav]");
    const sections = document.querySelector("[data-shop-sections]");

    if (!nav || !sections) {
      return;
    }

    data.categories.forEach((category) => {
      const navLink = document.createElement("a");
      navLink.href = `#${category.id}`;
      navLink.textContent = category.title;
      nav.appendChild(navLink);

      const section = document.createElement("section");
      section.className = "shop-category";
      section.id = category.id;
      section.innerHTML = `
        <div class="shop-category-head">
          <div class="eyebrow">${category.label}</div>
          <div>
            <h2>${category.title}</h2>
            <p>${category.description}</p>
          </div>
        </div>
      `;

      const grid = document.createElement("div");
      grid.className = "product-grid";

      category.slugs
        .map((slug) => productIndex.get(slug))
        .filter(Boolean)
        .forEach((product) => {
          grid.appendChild(createProductCard(product));
        });

      section.appendChild(grid);
      sections.appendChild(section);
    });
  };

  const styleNounFromTitle = (title) => {
    const lookup = [
      ["jacket", "jacket"],
      ["denim", "denim"],
      ["jean", "denim"],
      ["trouser", "trousers"],
      ["pant", "trousers"],
      ["skirt", "skirt"],
      ["dress", "dress"],
      ["vest", "vest"],
      ["sweatshirt", "sweatshirt"],
      ["top", "top"],
      ["shirt", "shirt"]
    ];
    const lower = title.toLowerCase();
    for (const [needle, label] of lookup) {
      if (lower.includes(needle)) return label;
    }
    return "garment";
  };

  const renderProduct = () => {
    const page = document.querySelector("[data-product-page]");

    if (!page) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const requestedSlug = params.get("slug");
    const product = productIndex.get(requestedSlug) || productIndex.get(data.home.featuredSlugs[0]);

    if (!product) {
      return;
    }

    document.title = `${product.title} | Lorimer`;
    const variant = product.variant === "sellable" ? "sellable" : "archived";
    page.dataset.variant = variant;

    const title = document.querySelector("[data-product-title]");
    const price = document.querySelector("[data-product-price]");
    const inquiry = document.querySelector("[data-product-inquiry]");
    const stock = document.querySelector("[data-product-stock]");
    const colorsField = document.querySelector("[data-product-colors-field]");
    const colors = document.querySelector("[data-product-colors]");
    const sizes = document.querySelector("[data-product-sizes]");
    const cta = document.querySelector("[data-product-cta]");
    const date = document.querySelector("[data-product-date]");
    const description = document.querySelector("[data-product-description]");
    const details = document.querySelector("[data-product-details]");
    const gallery = document.querySelector("[data-product-gallery]");
    const styleGallery = document.querySelector("[data-style-gallery]");
    const styleNoun = document.querySelector("[data-style-noun]");

    title.textContent = product.title;
    price.textContent = product.priceLabel;
    description.textContent = product.description;
    details.textContent = product.details;

    if (variant === "sellable") {
      stock.textContent = product.statusLabel || "In Stock";
      stock.hidden = false;
      inquiry.hidden = true;
    } else {
      inquiry.href = `mailto:${data.contact.email}?subject=${encodeURIComponent(`Lorimer inquiry: ${product.title}`)}`;
      inquiry.textContent = product.inquiryLabel || "Inquiry";
      inquiry.hidden = false;
      stock.hidden = true;
    }

    if (variant === "sellable" && Array.isArray(product.colors) && product.colors.length) {
      product.colors.forEach((color, index) => {
        const swatch = document.createElement("button");
        swatch.type = "button";
        swatch.className = "swatch" + (index === 0 ? " is-selected" : "");
        swatch.setAttribute("aria-label", color.label);
        swatch.style.background = color.hex;
        colors.appendChild(swatch);
      });
      colorsField.hidden = false;
    }

    product.sizes.forEach((size, index) => {
      const pill = document.createElement("span");
      pill.className = "size-pill" + (variant === "archived" || index === 0 ? " is-selected" : "");
      pill.textContent = size;
      sizes.appendChild(pill);
    });

    const ctaLabel = product.ctaLabel || (variant === "sellable" ? "Add to Cart" : "Archived");
    cta.textContent = ctaLabel;
    cta.classList.add(variant === "sellable" ? "is-sellable" : "is-archived");
    if (variant === "sellable") {
      cta.addEventListener("click", () => {
        cta.textContent = "Added";
        window.setTimeout(() => { cta.textContent = ctaLabel; }, 1400);
      });
    } else {
      cta.disabled = true;
    }

    if (variant === "archived" && product.dateOfConstruction) {
      date.textContent = `Date of Construction: ${product.dateOfConstruction}`;
      date.hidden = false;
    }

    const primaryFrame = document.createElement("figure");
    primaryFrame.className = "product-gallery-primary";
    primaryFrame.appendChild(createImage(product.gallery[0].src, product.gallery[0].alt, "product-gallery-image"));
    gallery.appendChild(primaryFrame);

    if (product.gallery.length > 1) {
      const secondary = document.createElement("div");
      secondary.className = "product-gallery-secondary";
      product.gallery.slice(1).forEach((image) => {
        const frame = document.createElement("figure");
        frame.className = "product-gallery-tile";
        frame.appendChild(createImage(image.src, image.alt, "product-gallery-image"));
        secondary.appendChild(frame);
      });
      gallery.appendChild(secondary);
    }

    styleNoun.textContent = styleNounFromTitle(product.title);

    product.styleGallery.slice(0, 3).forEach((image) => {
      const frame = document.createElement("figure");
      frame.className = "style-gallery-frame";
      frame.appendChild(createImage(image.src, image.alt, "style-gallery-image"));
      styleGallery.appendChild(frame);
    });
  };

  const renderLooks = () => {
    const rail = document.querySelector("[data-look-rail]");
    const list = document.querySelector("[data-look-list]");

    if (!rail || !list) {
      return;
    }

    data.looks.forEach((look, index) => {
      const railLink = document.createElement("a");
      railLink.href = `#${look.id}`;
      railLink.textContent = look.label;
      rail.appendChild(railLink);

      const article = document.createElement("article");
      article.className = "look-row";
      article.id = look.id;
      article.dataset.align = index % 2 === 0 ? "left" : "right";

      const media = document.createElement("div");
      media.className = "look-media";
      const primary = document.createElement("figure");
      primary.className = "look-media-primary";
      primary.appendChild(createImage(look.images[0].src, look.images[0].alt, "look-image"));
      media.appendChild(primary);

      if (look.images[1]) {
        const stack = document.createElement("div");
        stack.className = "look-media-stack";
        look.images.slice(1, 3).forEach((image) => {
          const frame = document.createElement("figure");
          frame.className = "look-media-secondary";
          frame.appendChild(createImage(image.src, image.alt, "look-image"));
          stack.appendChild(frame);
        });
        media.appendChild(stack);
      }

      const body = document.createElement("div");
      body.className = "look-copy";
      body.innerHTML = `
        <div class="eyebrow">${look.label}</div>
        <h2>${look.title}</h2>
        <p>${look.caption}</p>
      `;

      const links = document.createElement("div");
      links.className = "look-links";

      look.productSlugs
        .map((slug) => productIndex.get(slug))
        .filter(Boolean)
        .forEach((product) => {
          const link = document.createElement("a");
          link.href = `product.html?slug=${product.slug}`;
          link.className = "look-product-link";
          link.textContent = product.title;
          links.appendChild(link);
        });

      body.appendChild(links);
      article.append(media, body);
      list.appendChild(article);
    });
  };

  const renderAbout = () => {
    const manifesto = document.querySelector("[data-about-manifesto]");

    if (!manifesto) {
      return;
    }

    data.aboutPrinciples.forEach((item) => {
      const article = document.createElement("article");
      article.className = "principle";
      article.innerHTML = `
        <div class="principle-index">${item.index}</div>
        <div>
          <h3>${item.title}</h3>
          <p>${item.copy}</p>
        </div>
      `;
      manifesto.appendChild(article);
    });
  };

  setNavState();
  setupMobileNav();
  setContact();
  renderHome();
  renderShop();
  renderProduct();
  renderLooks();
  renderAbout();
  root.style.setProperty("--texture-image", `url("${data.home.texture}")`);
})();
