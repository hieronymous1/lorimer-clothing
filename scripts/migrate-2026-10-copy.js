/* Riki's 15 October product descriptions. Changes copy only; refuses to
   replace newer admin edits. Safe to rerun. Run with DATABASE_URL set. */
const PRODUCTS = require('../js/products-data.js');

const PREVIOUS_COPY = {
  "lorimer-selvedge-denim": "Lorimer selvedge denim cut with a clean, structured silhouette and considered finishing throughout. Waxed and fabric-painted by hand — each pair develops its own character with wear.",
  "lorimer-selvedge-denim-black": "Lorimer selvedge denim in black — cut with a clean, structured silhouette and considered finishing throughout. Waxed and fabric-painted by hand, developing its own character with wear.",
  "phyllite-jacket": "Classic denim jacket treated with a matte wax finish for a distinct texture and weather resistance. Fitted silhouette with raw hem.",
  "phyllite-jacket-v2": "The subtle black two tone denim jacket is separated by its front and back panels seamlessly transitioning throughout the jacket's shoulders, sleeves and sides. Appearing in an exaggerated silhouette with a high crop on the body along with elongated sleeves and stainless steel buttons.\n\nLike a Phyllite stone reaching its metamorphosis due to subjected heat and pressure, the jacket is given an added sheen during an in-house fabric painting procedure that elevates the jacket's look and feel. The Phyllite Jacket is fully lined inside with a soft and light 100% cotton lining for extra comfort."
};

const CONTENT_REPLACEMENTS = [
  { key: "about.terms", previous: "contact@lorimer.com", next: "contact@lorimerclothing.com" },
  {
    "key": "about.brand",
    "previous": "Founded in Helsinki, Finland, Lorimer is an independent fashion label centred on the relationship between garment, wearer and time. Through considered pattern cutting, purposeful construction and a disciplined approach to materials, the brand creates clothing shaped by form, proportion and silhouette, designed to feel instinctive to wear while remaining quietly distinctive.",
    "next": "Founded in Helsinki, Finland, Lorimer is an independent fashion label exploring the relationship between garment, wearer and time. Considered pattern cutting and construction shape each piece through proportion, silhouette and the character of its materials."
  },
  {
    "key": "about.brand",
    "previous": "Lorimer focuses on garments that evolve with use, softening over time and taking on character through movement, wear and everyday life. Each piece is intended to accompany its wearer beyond the first impression, developing in a way that is unique to the individual and shaped by the life it lives.",
    "next": "Our garments evolve with use, softening and taking on character through movement and everyday wear. Each piece develops differently, shaped by the person who wears it."
  },
  {
    "key": "about.brand",
    "previous": "Responsibility is approached through permanence rather than excess. By producing in limited quantities, prioritising considered manufacturing and focusing on enduring design over disposable consumption.<br>The brand is built on the belief that thoughtful design should remain accessible. By maintaining a direct relationship with its customers, Lorimer aims to place lasting garments into the hands of those who will build a personal connection with them.",
    "next": "We produce in limited quantities, with a focus on careful construction and garments intended for lasting wear.<br>Thoughtful design should remain accessible. By selling directly to our customers, we aim to make pieces that people can build a personal connection with over time."
  },
  {
    "key": "about.terms",
    "previous": "lorimer-clothing.com",
    "next": "lorimerclothing.com"
  },
  {
    "key": "about.terms",
    "previous": "Pricing, VAT &amp; Customs, and Privacy Policy pages",
    "next": "and Pricing, VAT &amp; Customs sections"
  },
  {
    "key": "about.payments",
    "previous": "We accept all major credit and debit cards, together with a selection of trusted local and digital payment methods, including Apple Pay, Google Pay, PayPal, Klarna and MobilePay where available.",
    "next": "Payments are handled through Stripe Checkout. The cards, digital wallets and local payment methods available for your order are shown at checkout."
  },
  {
    "key": "about.payments",
    "previous": "All payments are processed securely through certified payment providers using encrypted connections.",
    "next": "Payments are processed securely by Stripe using encrypted connections."
  }
];

async function migrate(sql) {
  for (const [id, previous] of Object.entries(PREVIOUS_COPY)) {
    const description = PRODUCTS.find(product => product.id === id).description;
    const rows = await sql`
      update products
      set description = ${description}, updated_at = now()
      where id = ${id} and description in (${previous}, ${description})
      returning id
    `;
    if (!rows.length) throw new Error(`${id}: missing product or newer admin copy; review before replacing`);
  }
  for (const { key, previous, next } of CONTENT_REPLACEMENTS) {
    await sql`
      update content
      set value = replace(value, ${previous}, ${next}), updated_at = now()
      where key = ${key} and position(${previous} in value) > 0
    `;
  }
}

module.exports = { migrate, PREVIOUS_COPY, CONTENT_REPLACEMENTS };

if (require.main === module) {
  const { getDb } = require('../api/_lib/db');
  migrate(getDb())
    .then(() => console.log('migrate-2026-10-copy: updated product and About copy'))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
