/* ============================================================
   SITE CONFIG — everything brandable lives here.
   Swap the name, WhatsApp number, announcement, copy and
   collection blurbs to rebrand the whole store in one file.
   ============================================================ */

export const brand = {
  name: 'MAHRU',
  tagline: 'Luxury Ethnic Wear',
  // WhatsApp number in international format, digits only (no + or spaces).
  whatsapp: '923000000000',
  phoneDisplay: '+92 300 0000000',
  email: 'hello@mahru.pk',
  address: 'Demo Boutique, MM Alam Road, Gulberg III, Lahore',
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
  youtube: 'https://youtube.com/',
};

export const announcement =
  'Free delivery across Pakistan on orders above Rs.5,000 · Worldwide shipping available';

export const currencyPrefix = 'Rs.';

/* ---------- navigation (header) ---------- */
export type NavChild = { label: string; to: string };
export type NavItem = { label: string; to?: string; hot?: boolean; children?: NavChild[] };

export const nav: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Sale', to: '/collections/sale', hot: true },
  { label: 'Formals', to: '/collections/formals' },
  { label: 'Luxury Formals', to: '/collections/luxury-formals' },
  {
    label: 'Pret',
    children: [
      { label: 'Silk Pret', to: '/collections/silk-pret' },
      { label: 'Formal Pret', to: '/collections/formal-pret' },
      { label: 'Lawn Pret', to: '/collections/lawn-pret' },
    ],
  },
  { label: 'Co-ords', to: '/collections/co-ords' },
  {
    label: 'Lawn',
    children: [
      { label: 'Lawn Pret', to: '/collections/lawn-pret' },
      { label: 'Unstitched', to: '/collections/unstitched-lawn' },
    ],
  },
  { label: 'Bridal', to: '/collections/bridal' },
  { label: 'New Arrivals', to: '/collections/new-arrivals' },
  { label: 'Best Sellers', to: '/collections/best-sellers' },
  {
    label: 'About',
    children: [
      { label: 'Our Story', to: '/pages/our-story' },
      { label: 'Shipping & Delivery', to: '/pages/shipping-delivery' },
      { label: 'Returns & Exchange', to: '/pages/returns-exchange' },
      { label: 'Size Guide', to: '/pages/size-guide' },
      { label: 'FAQs', to: '/pages/faqs' },
      { label: 'Contact Us', to: '/pages/contact' },
    ],
  },
];

/* ---------- collection metadata (titles/blurbs for tiles & headers) ---------- */
export type CollectionMeta = { handle: string; title: string; blurb: string; tile?: boolean };

export const collections: CollectionMeta[] = [
  { handle: 'new-arrivals', title: 'New Arrivals', blurb: 'The latest pieces from our ateliers, fresh off the karkhana.', tile: true },
  { handle: 'formals', title: 'Formals', blurb: 'Hand-embellished formal wear for soirées and celebrations.', tile: true },
  { handle: 'luxury-formals', title: 'Luxury Formals', blurb: 'Our most intricate work — couture-grade embroidery on pure fabrics.', tile: true },
  { handle: 'silk-pret', title: 'Silk Pret', blurb: 'Ready-to-wear silks with a quiet, polished shine.', tile: true },
  { handle: 'formal-pret', title: 'Formal Pret', blurb: 'Occasion-ready pret, stitched and finished by hand.', tile: true },
  { handle: 'lawn-pret', title: 'Lawn Pret', blurb: 'Breezy stitched lawn for long summer days.', tile: true },
  { handle: 'unstitched-lawn', title: 'Unstitched Lawn', blurb: 'Signature prints on premium lawn, yours to tailor.', tile: true },
  { handle: 'co-ords', title: 'Co-ord Sets', blurb: 'Effortless matching sets with an easy, modern line.', tile: true },
  { handle: 'bridal', title: 'Bridal', blurb: 'Heirloom bridals, hand-worked over hundreds of hours.', tile: true },
  { handle: 'best-sellers', title: 'Best Sellers', blurb: 'The pieces our customers keep coming back for.' },
  { handle: 'sale', title: 'Sale', blurb: 'Limited stock at limited-time prices.' },
];

export const collectionMeta = (handle: string): CollectionMeta =>
  collections.find((c) => c.handle === handle) || {
    handle,
    title: handle.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
    blurb: '',
  };

/* ---------- home page composition ---------- */
export const hero = {
  eyebrow: 'The Festive Edit · 2026',
  headline: 'Woven by hand, worn for a lifetime.',
  sub: 'Formals, pret and bridal wear crafted by master artisans — zardozi, resham and mirror-work on fabrics chosen to last.',
  ctaLabel: 'Shop New Arrivals',
  ctaTo: '/collections/new-arrivals',
  cta2Label: 'Explore Bridal',
  cta2To: '/collections/bridal',
};

export const homeRows: { handle: string; limit: number }[] = [
  { handle: 'new-arrivals', limit: 8 },
  { handle: 'formals', limit: 8 },
  { handle: 'formal-pret', limit: 8 },
  { handle: 'bridal', limit: 4 },
  { handle: 'unstitched-lawn', limit: 8 },
  { handle: 'lawn-pret', limit: 8 },
];

/* ---------- customer reviews (demo content) ---------- */
export type Review = { name: string; date: string; product: string; handle: string; title?: string; body: string; stars: number };

export const reviewsSummary = { average: 4.8, count: 312 };

export const reviews: Review[] = [
  { name: 'Amna R.', date: 'Jun 2026', product: 'Gulbahar', handle: 'gulbahar', title: 'Better than the pictures', body: 'The embroidery is so fine — my tailor kept asking where it was from. Fits true to size.', stars: 5 },
  { name: 'Hira S.', date: 'Jun 2026', product: 'Nooraniyat', handle: 'nooraniyat', body: 'Wore it to my cousin\u2019s walima and got compliments all evening. Fabric feels rich.', stars: 5 },
  { name: 'Mrs. Fahad', date: 'Jun 2026', product: 'Sheesh Mahal', handle: 'sheesh-mahal', title: 'Bridal of my dreams', body: 'They kept me updated at every stage. The dupatta work alone is worth it.', stars: 5 },
  { name: 'Zainab K.', date: 'May 2026', product: 'Chandni Raat', handle: 'chandni-raat', body: 'Delivery was quicker than promised. Colour is exactly as shown.', stars: 5 },
  { name: 'Maha A.', date: 'May 2026', product: 'Sitara', handle: 'sitara', body: 'Lovely everyday lawn — soft and doesn\u2019t crease easily. Buying two more.', stars: 4 },
  { name: 'Rabia T.', date: 'May 2026', product: 'Mahjabeen', handle: 'mahjabeen', title: '100% recommended', body: 'Stitching is neat, lining is proper, and the fit was spot on.', stars: 5 },
  { name: 'Sana I.', date: 'Apr 2026', product: 'Zarnigar', handle: 'zarnigar', body: 'Ordered from the UK — arrived in six days, beautifully packed.', stars: 5 },
  { name: 'Dr. Neha', date: 'Apr 2026', product: 'Feroza', handle: 'feroza', body: 'Elegant and understated. The silk drapes really well.', stars: 4 },
  { name: 'Khadija M.', date: 'Apr 2026', product: 'Raat ki Rani', handle: 'raat-ki-rani', title: 'Exactly as advertised', body: 'True to photos, generous fabric, and customer service replied on WhatsApp within minutes.', stars: 5 },
];

/* ---------- static pages ---------- */
export type PageBlock =
  | { h: string; p: string }
  | { faq: { q: string; a: string }[] }
  | { table: { head: string[]; rows: string[][] } };

export const pages: Record<string, { title: string; intro?: string; blocks: PageBlock[] }> = {
  'our-story': {
    title: 'Our Story',
    intro: 'A small atelier with a simple belief: clothes made slowly, by hand, feel different.',
    blocks: [
      { h: 'Craft first', p: 'Every MAHRU piece begins on paper, moves to the karkhana, and passes through the hands of embroiderers, cutters and finishers before it reaches you. We work with a small circle of master artisans in Lahore and pay them fairly for work that cannot be rushed.' },
      { h: 'Materials that last', p: 'We source pure fabrics — raw silk, organza, chiffon, premium lawn — and match them with thread-work meant to survive decades of weddings, not one season of trends.' },
      { h: 'Made to be worn', p: 'Luxury should still be wearable. Our cuts are generous, our linings are proper, and our pret is finished so you can wear it straight out of the box.' },
    ],
  },
  'shipping-delivery': {
    title: 'Shipping & Delivery',
    blocks: [
      { h: 'Within Pakistan', p: 'Orders are dispatched within 1–2 working days and delivered in 2–4 working days. Delivery is free on orders above Rs.5,000; a flat Rs.350 applies below that. Express-tagged items ship the same day when ordered before 2 pm.' },
      { h: 'International', p: 'We ship worldwide via courier. International delivery typically takes 5–8 working days; charges are calculated at checkout based on destination and weight. Duties and taxes, where applicable, are the customer\u2019s responsibility.' },
      { h: 'Bridal & made-to-order', p: 'Bridal pieces are made to order and take 6–10 weeks depending on the work involved. Our team confirms your timeline on WhatsApp after the order is placed.' },
    ],
  },
  'returns-exchange': {
    title: 'Returns & Exchange',
    blocks: [
      { h: 'Exchange window', p: 'Unworn items with tags intact can be exchanged within 7 days of delivery. Sale items are exchangeable for size only, subject to availability.' },
      { h: 'What cannot be returned', p: 'Bridal, made-to-order and customised pieces cannot be returned or exchanged. Unstitched fabric cannot be returned once cut.' },
      { h: 'How to start', p: 'Message us on WhatsApp with your order number and the reason for exchange. We will arrange a pickup or share the return address, and process the exchange within 3–5 working days of receiving the item.' },
    ],
  },
  'size-guide': {
    title: 'Size Guide',
    intro: 'Measurements are in inches. Between sizes? We recommend sizing up — our tailors can always take a piece in.',
    blocks: [
      {
        table: {
          head: ['Size', 'Bust', 'Waist', 'Hip', 'Shirt Length'],
          rows: [
            ['XS', '32', '26', '35', '38'],
            ['S', '34', '28', '37', '39'],
            ['M', '36', '30', '39', '40'],
            ['L', '38', '32', '41', '41'],
            ['XL', '40', '34', '43', '42'],
          ],
        },
      },
      { h: 'Custom sizing', p: 'Most formal and bridal pieces can be made to your measurements at no extra cost. Choose your closest size at checkout and send us your measurements on WhatsApp.' },
    ],
  },
  faqs: {
    title: 'Frequently Asked Questions',
    blocks: [
      {
        faq: [
          { q: 'Do you offer Cash on Delivery?', a: 'Yes — COD is available across Pakistan. You can also pay by bank transfer; our team shares account details on WhatsApp after you place the order.' },
          { q: 'Are the colours accurate?', a: 'We photograph in daylight and edit minimally, but screens vary. Expect a slight difference of up to one shade.' },
          { q: 'Can I get a piece customised?', a: 'Yes. Sleeve length, shirt length and minor design tweaks are possible on most formals. Message us before ordering.' },
          { q: 'How do I track my order?', a: 'A tracking number is shared on WhatsApp and email as soon as your parcel is booked.' },
          { q: 'Do you ship internationally?', a: 'Yes, worldwide. Shipping is calculated at checkout and delivery takes 5–8 working days.' },
        ],
      },
    ],
  },
  contact: {
    title: 'Contact Us',
    intro: 'Questions about a piece, an order, or a custom bridal? We answer fastest on WhatsApp.',
    blocks: [],
  },
};

/* ---------- footer ---------- */
export const footerMenus = [
  {
    title: 'Shop',
    links: [
      { label: 'New Arrivals', to: '/collections/new-arrivals' },
      { label: 'Formals', to: '/collections/formals' },
      { label: 'Bridal', to: '/collections/bridal' },
      { label: 'Lawn', to: '/collections/lawn-pret' },
      { label: 'Sale', to: '/collections/sale' },
    ],
  },
  {
    title: 'Customer Care',
    links: [
      { label: 'Shipping & Delivery', to: '/pages/shipping-delivery' },
      { label: 'Returns & Exchange', to: '/pages/returns-exchange' },
      { label: 'Size Guide', to: '/pages/size-guide' },
      { label: 'FAQs', to: '/pages/faqs' },
      { label: 'Contact Us', to: '/pages/contact' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story', to: '/pages/our-story' },
      { label: 'Search', to: '/search' },
      { label: 'Cart', to: '/cart' },
    ],
  },
];
