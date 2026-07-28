import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, Minus, Plus, Truck, RotateCcw, MessageCircle } from 'lucide-react';
import { getProduct, getProducts } from '../lib/catalog';
import type { Product } from '../lib/types';
import { useCart } from '../lib/cart';
import { money, pctOff, ProductCard, SectionHead, AutoGallery } from '../ui';
import { brand, collectionMeta } from '../data/site';

function Accordion({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [o, setO] = useState(open);
  return (
    <div className="border-b border-line">
      <button className="flex w-full items-center justify-between py-4 text-left" onClick={() => setO(!o)}>
        <span className="text-[11px] uppercase tracking-label">{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${o ? 'rotate-180' : ''}`} />
      </button>
      {o && <div className="pb-5 text-sm leading-relaxed text-ink/75">{children}</div>}
    </div>
  );
}

export default function ProductPage() {
  const { handle = '' } = useParams();
  const { add } = useCart();
  const [p, setP] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState<Product[]>([]);
  const [warn, setWarn] = useState('');

  useEffect(() => {
    setP(null);
    setNotFound(false);
    setQty(1);
    setSize('');
    setWarn('');
    window.scrollTo(0, 0);
    getProduct(handle).then((prod) => {
      if (!prod) return setNotFound(true);
      setP(prod);
      const firstAvail = prod.variants.find((v) => v.available);
      if (prod.variants.length === 1) setSize(prod.variants[0].size);
      else if (firstAvail && prod.variants.length <= 2) setSize(firstAvail.size);
      getProducts({ collection: prod.collection, limit: 9 }).then((list) =>
        setRelated(list.filter((x) => x.handle !== prod.handle).slice(0, 4)),
      );
    });
  }, [handle]);

  if (notFound)
    return (
      <div className="mx-auto max-w-[1320px] px-5 py-24 text-center">
        <h1 className="font-serif text-4xl font-semibold">Piece not found</h1>
        <p className="mt-2 text-muted">It may have sold out or been removed.</p>
        <Link to="/" className="mt-6 inline-block border border-ink px-8 py-3 text-[11px] uppercase tracking-label hover:bg-ink hover:text-white">
          Back to home
        </Link>
      </div>
    );

  if (!p)
    return (
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-10 lg:grid-cols-2">
        <div className="aspect-product animate-pulse bg-line/60" />
        <div className="space-y-4 py-6">
          <div className="h-8 w-2/3 animate-pulse bg-line/60" />
          <div className="h-5 w-1/3 animate-pulse bg-line/60" />
          <div className="h-24 w-full animate-pulse bg-line/60" />
        </div>
      </div>
    );

  const off = pctOff(p.price, p.compareAt);
  const meta = collectionMeta(p.collection);

  // Auto-gallery: derive the product's image folder from its first path and try
  // 1.jpg..6.jpg. Whatever you actually pasted shows up; missing numbers are
  // skipped. No code editing needed to add more angles.
  const firstImg = p.images[0] || '';
  const folder = /\/images\/products\/[^/]+\//.test(firstImg)
    ? firstImg.replace(/[^/]+$/, '')
    : null;
  const candidates = folder
    ? [1, 2, 3, 4, 5, 6].map((n) => `${folder}${n}.jpg`)
    : p.images.length
      ? p.images
      : [];

  const addToBag = () => {
    if (p.soldOut) return;
    if (!size) return setWarn('Please choose a size first.');
    const variant = p.variants.find((v) => v.size === size);
    add(
      {
        handle: p.handle,
        title: p.title,
        price: p.price,
        size,
        image: p.images[0],
        variantId: variant?.id,
      },
      qty,
    );
  };

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8">
      <nav className="mb-5 text-xs text-muted">
        <Link to="/" className="hover:text-gold">Home</Link>
        <span className="mx-1.5">/</span>
        <Link to={`/collections/${p.collection}`} className="hover:text-gold">{meta.title}</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{p.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* gallery — shows whatever photos exist in this product's folder */}
        <div>
          <AutoGallery candidates={candidates} seed={p.handle} alt={p.title} label={p.title} />
        </div>

        {/* details */}
        <div>
          <p className="text-[11px] uppercase tracking-label text-muted">{meta.title}</p>
          <h1 className="mt-1 font-serif text-4xl font-semibold leading-tight sm:text-5xl">{p.title}</h1>
          <div className="mt-3 flex items-baseline gap-3">
            {p.compareAt && p.compareAt > p.price && (
              <span className="text-lg text-muted line-through">{money(p.compareAt)}</span>
            )}
            <span className={`font-serif text-3xl font-semibold ${off ? 'text-henna' : ''}`}>{money(p.price)}</span>
            {off > 0 && <span className="bg-henna px-2 py-0.5 text-[10px] uppercase tracking-label text-white">{off}% off</span>}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-ink/75">{p.description}</p>
          {p.fabric && <p className="mt-2 text-sm text-muted">Fabric: {p.fabric}</p>}

          {/* size */}
          <div className="mt-7">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-label">Size</span>
              <Link to="/pages/size-guide" className="text-xs text-muted underline underline-offset-2 hover:text-gold">
                Size guide
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.variants.map((v) => (
                <button
                  key={v.size}
                  disabled={!v.available}
                  onClick={() => {
                    setSize(v.size);
                    setWarn('');
                  }}
                  className={`min-w-12 border px-4 py-2.5 text-sm transition-colors ${
                    size === v.size
                      ? 'border-ink bg-ink text-white'
                      : v.available
                        ? 'border-line hover:border-ink'
                        : 'cursor-not-allowed border-line text-muted line-through opacity-50'
                  }`}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>

          {/* qty + add */}
          <div className="mt-6 flex gap-3">
            <div className="flex items-center border border-line">
              <button aria-label="Decrease quantity" className="grid h-12 w-11 place-items-center hover:bg-ivory" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center">{qty}</span>
              <button aria-label="Increase quantity" className="grid h-12 w-11 place-items-center hover:bg-ivory" onClick={() => setQty((q) => Math.min(10, q + 1))}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={addToBag}
              disabled={p.soldOut}
              className="flex-1 bg-ink py-3.5 text-[11px] uppercase tracking-label text-white transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
            >
              {p.soldOut ? 'Sold out' : 'Add to bag'}
            </button>
          </div>
          {warn && <p className="mt-2 text-xs text-henna">{warn}</p>}

          <a
            href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(`Hello! I have a question about "${p.title}" (${money(p.price)}).`)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center justify-center gap-2 border border-ink py-3 text-[11px] uppercase tracking-label transition-colors hover:bg-ink hover:text-white"
          >
            <MessageCircle className="h-4 w-4" /> Ask about this piece
          </a>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted">
            <p className="flex items-center gap-2"><Truck className="h-4 w-4" /> Free delivery over {money(5000)}</p>
            <p className="flex items-center gap-2"><RotateCcw className="h-4 w-4" /> 7-day exchange</p>
          </div>

          {/* accordions */}
          <div className="mt-8 border-t border-line">
            <Accordion title="Details & craft" open>
              {p.description} Each piece is checked by hand before dispatch; slight variations in embroidery are the signature of handwork, not a flaw.
            </Accordion>
            <Accordion title="Shipping & delivery">
              Dispatched in 1–2 working days. Within Pakistan: 2–4 working days, free above {money(5000)}. International: 5–8 working days, calculated at checkout. See our <Link to="/pages/shipping-delivery" className="underline underline-offset-2">shipping policy</Link>.
            </Accordion>
            <Accordion title="Returns & exchange">
              Unworn items with tags can be exchanged within 7 days. Bridal and made-to-order pieces are final sale. Full policy <Link to="/pages/returns-exchange" className="underline underline-offset-2">here</Link>.
            </Accordion>
          </div>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="pt-16">
          <SectionHead title="You may also like" to={`/collections/${p.collection}`} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.handle} p={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
