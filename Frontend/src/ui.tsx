import { ReactNode, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronDown, Menu, X, Search, ShoppingBag, Minus, Plus, Trash2, Star,
  MessageCircle, ArrowRight, Loader2,
} from 'lucide-react';
import { brand, announcement, nav, currencyPrefix, footerMenus, NavItem } from './data/site';
import { useCart } from './lib/cart';
import { apiPost } from './lib/api';
import type { Product } from './lib/types';

/* ---------------- formatting ---------------- */
export const money = (n: number) => currencyPrefix + (Number(n) || 0).toLocaleString();
export const pctOff = (price: number, compareAt?: number | null) =>
  compareAt && compareAt > price ? Math.round((1 - price / compareAt) * 100) : 0;

/* ---------------- signature: deterministic fabric-swatch art ----------------
   Any product/collection without a photo renders as an elegant embroidered
   fabric swatch — deep couture colours, a woven ground, and a hand-drawn
   embroidery motif (deterministic per handle, consistent across visits).
   Drop real images into /public/images and they take over automatically. */
function hashOf(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

// curated couture palettes (ground, deep, gold/thread) — picked, not random hues
const SWATCH_PALETTES: [string, string, string][] = [
  ['#6d1f2b', '#4a1420', '#d9b56b'], // deep maroon + gold
  ['#1f3d3a', '#132a27', '#cbb06a'], // emerald + antique gold
  ['#243a52', '#16283a', '#c9ab6b'], // sapphire + gold
  ['#3f2a4d', '#291a33', '#d2b673'], // aubergine + gold
  ['#7a3b22', '#552612', '#e0c07a'], // rust + honey
  ['#2b2b2b', '#161616', '#c9a24b'], // charcoal + gold
  ['#5c4a1f', '#3c3013', '#e6d199'], // olive-gold
  ['#803049', '#571f31', '#e3b96f'], // plum-rose + gold
  ['#0f4c4a', '#093330', '#cdb06a'], // teal + gold
  ['#8a5a2b', '#5f3c1a', '#f0d59a'], // caramel + cream-gold
  ['#4a2f5e', '#301d3e', '#cba86a'], // violet + gold
  ['#2f4858', '#1d2f3a', '#c7ac68'], // steel-blue + gold
];

function motifPath(kind: number): string {
  // a few hand-tuned embroidery-style motifs drawn in a 100x100 tile
  switch (kind % 4) {
    case 0: // paisley
      return 'M50 20c16 0 26 12 26 26 0 16-14 30-30 30-11 0-19-8-19-18 0-9 7-16 16-16 6 0 11 4 11 10 0 5-3 8-7 8';
    case 1: // eight-petal flower
      return 'M50 30a8 8 0 0 1 8 8 8 8 0 0 1 8-8 8 8 0 0 1-8 8 8 8 0 0 1 8 8 8 8 0 0 1-8-8 8 8 0 0 1-8 8 8 8 0 0 1-8-8 8 8 0 0 1-8 8 8 8 0 0 1 8-8 8 8 0 0 1-8-8 8 8 0 0 1 8 8 8 8 0 0 1 8-8z';
    case 2: // leaf vine
      return 'M30 70c10-6 14-16 14-26M44 44c8 4 18 2 24-4M44 44c-6 6-8 16-4 24M44 44c6-8 6-18 0-26';
    default: // diamond lattice bloom
      return 'M50 28l14 22-14 22-14-22zM50 40l6 10-6 10-6-10z';
  }
}

export function SwatchArt({ seed, label, className = '' }: { seed: string; label?: string; className?: string }) {
  const n = hashOf(seed);
  const [ground, deep, gold] = SWATCH_PALETTES[n % SWATCH_PALETTES.length];
  const motif = motifPath(n >> 3);
  const rot = (n >> 5) % 24 - 12;
  const gid = `g${n % 100000}`;
  const dense = 3 + (n % 3); // motif grid density

  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden style={{ background: deep }}>
      <svg viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`${gid}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={ground} />
            <stop offset="60%" stopColor={ground} />
            <stop offset="100%" stopColor={deep} />
          </linearGradient>
          <radialGradient id={`${gid}-glow`} cx="50%" cy="38%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <pattern id={`${gid}-weave`} width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="none" />
            <path d="M0 3h6M3 0v6" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
          </pattern>
          <pattern id={`${gid}-motif`} width={400 / dense} height={400 / dense}
                   patternUnits="userSpaceOnUse" patternTransform={`rotate(${rot})`}>
            <g transform={`translate(${200 / dense - 50},${200 / dense - 50}) scale(${dense * 0.4})`}>
              <path d={motif} fill="none" stroke={gold} strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="50" cy="50" r="2" fill={gold} fillOpacity="0.5" />
            </g>
          </pattern>
        </defs>

        <rect width="400" height="520" fill={`url(#${gid}-bg)`} />
        <rect width="400" height="520" fill={`url(#${gid}-weave)`} />
        <rect width="400" height="520" fill={`url(#${gid}-motif)`} />
        <rect width="400" height="520" fill={`url(#${gid}-glow)`} />

        {/* fine gold inner border, like a swatch card */}
        <rect x="14" y="14" width="372" height="492" fill="none" stroke={gold} strokeOpacity="0.45" strokeWidth="1" />
        <rect x="19" y="19" width="362" height="482" fill="none" stroke={gold} strokeOpacity="0.2" strokeWidth="0.75" />
      </svg>

      {/* centered serif monogram */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ containerType: 'inline-size' }}>
        <span className="select-none font-serif italic leading-none" style={{ fontSize: '30cqw', color: gold, opacity: 0.9, textShadow: '0 2px 20px rgba(0,0,0,0.35)' }}>
          {(label || seed).charAt(0).toUpperCase()}
        </span>
      </div>

      {label && (
        <span className="absolute bottom-0 left-0 m-3 select-none text-[10px] uppercase tracking-label text-white/70">{label}</span>
      )}
    </div>
  );
}

/* ---------------- AutoGallery: shows whatever images actually exist in a folder ----------------
   Give it a list of candidate image URLs (e.g. 1.jpg..6.jpg). It renders only the
   ones that successfully load and skips the rest, so you can just paste photos into
   a product's folder and they appear — no config. Falls back to swatch art if none. */
export function AutoGallery({ candidates, seed, alt, label }: { candidates: string[]; seed: string; alt: string; label?: string }) {
  const [ok, setOk] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!candidates.length) { setChecked(true); return; }
    Promise.all(
      candidates.map(
        (src) =>
          new Promise<string | null>((resolve) => {
            const im = new Image();
            im.onload = () => resolve(src);
            im.onerror = () => resolve(null);
            im.src = src;
          }),
      ),
    ).then((res) => {
      if (!alive) return;
      setOk(res.filter((s): s is string => !!s));
      setChecked(true);
    });
    return () => { alive = false; };
  }, [candidates.join('|')]);

  const [active, setActive] = useState(0);

  // nothing loaded (yet or at all) -> elegant swatch, never a broken frame
  if (!checked)
    return <div className="aspect-product animate-pulse bg-line/60" />;
  if (ok.length === 0)
    return (
      <div className="aspect-product overflow-hidden bg-line/40" style={{ containerType: 'inline-size' }}>
        <SwatchArt seed={seed} label={label} className="h-full w-full" />
      </div>
    );

  return (
    <div>
      <div className="aspect-product overflow-hidden bg-line/40">
        <img src={ok[active]} alt={alt} className="h-full w-full object-cover" />
      </div>
      {ok.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {ok.slice(0, 4).map((g, i) => (
            <button
              key={g}
              onClick={() => setActive(i)}
              className={`aspect-product overflow-hidden border ${active === i ? 'border-ink' : 'border-transparent'}`}
              aria-label={`View image ${i + 1}`}
            >
              <img src={g} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- SmartImg: real photo if present, swatch art otherwise ---------------- */
export function SmartImg({ src, seed, label, alt, className = '' }: { src?: string; seed: string; label?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <SwatchArt seed={seed} label={label} className={className} />;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

/* ---------------- scroll reveal ---------------- */
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ---------------- section header ---------------- */
export function SectionHead({ title, to, blurb }: { title: string; to?: string; blurb?: string }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4 border-t border-line pt-7">
      <div>
        <h2 className="font-serif text-3xl font-semibold sm:text-4xl">{title}</h2>
        {blurb && <p className="mt-1 max-w-xl text-sm text-muted">{blurb}</p>}
      </div>
      {to && (
        <Link to={to} className="group hidden shrink-0 items-center gap-1.5 text-[11px] uppercase tracking-label text-ink hover:text-gold sm:inline-flex">
          View all <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/* ---------------- product card ---------------- */
export function ProductCard({ p }: { p: Product }) {
  const off = pctOff(p.price, p.compareAt);
  return (
    <Link to={`/products/${p.handle}`} className="group block">
      <div className="relative aspect-product overflow-hidden bg-line/40" style={{ containerType: 'inline-size' }}>
        <SmartImg
          src={p.images[0]}
          seed={p.handle}
          alt={p.title}
          className="h-full w-full transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute left-0 top-3 flex flex-col gap-1.5">
          {p.soldOut ? (
            <span className="bg-ink px-2.5 py-1 text-[10px] uppercase tracking-label text-white">Sold out</span>
          ) : off > 0 ? (
            <span className="bg-henna px-2.5 py-1 text-[10px] uppercase tracking-label text-white">{off}% off</span>
          ) : null}
          {p.tags.includes('express') && !p.soldOut && (
            <span className="bg-white/90 px-2.5 py-1 text-[10px] uppercase tracking-label text-ink">Express delivery</span>
          )}
        </div>
      </div>
      <div className="mt-3 text-center">
        <h3 className="font-serif text-lg leading-snug">{p.title}</h3>
        <p className="mt-0.5 text-sm">
          {p.compareAt && p.compareAt > p.price && (
            <span className="mr-2 text-muted line-through">{money(p.compareAt)}</span>
          )}
          <span className={off > 0 ? 'font-medium text-henna' : 'text-ink'}>{money(p.price)}</span>
        </p>
      </div>
    </Link>
  );
}

export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((p, i) => (
        <Reveal key={p.handle} delay={Math.min(i, 7) * 40}>
          <ProductCard p={p} />
        </Reveal>
      ))}
    </div>
  );
}

/* ---------------- header ---------------- */
function DesktopNavItem({ item }: { item: NavItem }) {
  if (!item.children)
    return (
      <Link
        to={item.to || '/'}
        className={`whitespace-nowrap px-3 py-3 text-[11px] uppercase tracking-label transition-colors hover:text-gold ${item.hot ? 'text-henna' : 'text-ink'}`}
      >
        {item.label}
      </Link>
    );
  return (
    <div className="group relative">
      <button className="flex items-center gap-1 whitespace-nowrap px-3 py-3 text-[11px] uppercase tracking-label text-ink transition-colors hover:text-gold">
        {item.label} <ChevronDown className="h-3 w-3" />
      </button>
      <div className="invisible absolute left-1/2 top-full z-40 min-w-[210px] -translate-x-1/2 border border-line bg-paper py-2 opacity-0 shadow-[0_18px_40px_-18px_rgba(26,24,20,.25)] transition-all duration-200 group-hover:visible group-hover:opacity-100">
        {item.children.map((c) => (
          <Link key={c.to + c.label} to={c.to} className="block px-5 py-2 text-sm text-ink/80 hover:bg-ivory hover:text-gold">
            {c.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  const { count, openDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <div className="bg-ink px-4 py-2 text-center text-[11px] tracking-wide text-ivory/90">{announcement}</div>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3 px-4 py-3 lg:py-4">
          <button className="p-2 lg:hidden" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="select-none text-center">
            <span className="font-serif text-[26px] font-semibold tracking-[0.22em]">{brand.name}</span>
            <span className="block text-[9px] uppercase tracking-label text-muted">{brand.tagline}</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/search" aria-label="Search" className="p-2 text-ink hover:text-gold">
              <Search className="h-5 w-5" />
            </Link>
            <button aria-label="Cart" onClick={openDrawer} className="relative p-2 text-ink hover:text-gold">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-henna px-1 text-[10px] font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
        <nav className="mx-auto hidden max-w-[1320px] items-center justify-center px-4 lg:flex">
          {nav.map((item) => (
            <DesktopNavItem key={item.label} item={item} />
          ))}
        </nav>
      </header>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-paper">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="font-serif text-xl font-semibold tracking-[0.2em]">{brand.name}</span>
              <button aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {nav.map((item) =>
                item.children ? (
                  <div key={item.label} className="border-b border-line/70">
                    <button
                      className="flex w-full items-center justify-between px-5 py-3.5 text-[12px] uppercase tracking-label"
                      onClick={() => setExpanded((e) => (e === item.label ? null : item.label))}
                    >
                      {item.label}
                      <ChevronDown className={`h-4 w-4 transition-transform ${expanded === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    {expanded === item.label && (
                      <div className="pb-2">
                        {item.children.map((c) => (
                          <Link
                            key={c.to + c.label}
                            to={c.to}
                            onClick={() => setMobileOpen(false)}
                            className="block px-8 py-2.5 text-sm text-ink/75"
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    to={item.to || '/'}
                    onClick={() => setMobileOpen(false)}
                    className={`block border-b border-line/70 px-5 py-3.5 text-[12px] uppercase tracking-label ${item.hot ? 'text-henna' : ''}`}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </div>
            <a
              href={`https://wa.me/${brand.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="m-5 flex items-center justify-center gap-2 bg-ink py-3 text-[11px] uppercase tracking-label text-white"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </a>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- cart drawer ---------------- */
export function CartDrawer() {
  const { items, subtotal, drawerOpen, closeDrawer, setQty, remove } = useCart();
  const navigate = useNavigate();
  if (!drawerOpen) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40" onClick={closeDrawer} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-serif text-2xl font-semibold">Your bag</h2>
          <button aria-label="Close cart" onClick={closeDrawer}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-8 w-8 text-muted" />
            <p className="text-muted">Your bag is empty.</p>
            <button onClick={closeDrawer} className="mt-1 border border-ink px-6 py-2.5 text-[11px] uppercase tracking-label hover:bg-ink hover:text-white">
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((it) => (
                <div key={it.handle + it.size} className="flex gap-4 py-4">
                  <div className="h-24 w-[72px] shrink-0 overflow-hidden bg-line/40" style={{ containerType: 'inline-size' }}>
                    <SmartImg src={it.image} seed={it.handle} alt={it.title} className="h-full w-full" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-serif text-lg leading-tight">{it.title}</p>
                        <p className="mt-0.5 text-xs text-muted">Size: {it.size}</p>
                      </div>
                      <button aria-label="Remove" onClick={() => remove(it.handle, it.size)} className="text-muted hover:text-henna">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border border-line">
                        <button aria-label="Decrease" className="grid h-8 w-8 place-items-center hover:bg-ivory" onClick={() => setQty(it.handle, it.size, it.qty - 1)}>
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm">{it.qty}</span>
                        <button aria-label="Increase" className="grid h-8 w-8 place-items-center hover:bg-ivory" onClick={() => setQty(it.handle, it.size, it.qty + 1)}>
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-medium">{money(it.price * it.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-line px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-label text-muted">Subtotal</span>
                <span className="font-serif text-xl font-semibold">{money(subtotal)}</span>
              </div>
              <p className="mb-3 text-xs text-muted">Shipping calculated at checkout. Free above {money(5000)} within Pakistan.</p>
              <button
                onClick={() => {
                  closeDrawer();
                  navigate('/checkout');
                }}
                className="w-full bg-ink py-3.5 text-[11px] uppercase tracking-label text-white transition-colors hover:bg-gold"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

/* ---------------- reviews ---------------- */
export function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= n ? 'fill-gold text-gold' : 'text-line'}`} />
      ))}
    </span>
  );
}

/* ---------------- newsletter ---------------- */
export function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'err'>('idle');
  const submit = async () => {
    if (!email.includes('@')) return setState('err');
    setState('busy');
    try {
      const r = await apiPost('/api/newsletter', { email });
      setState(r.ok ? 'done' : 'err');
    } catch {
      setState('err');
    }
  };
  return (
    <div className="mx-auto max-w-md text-center">
      <h3 className="font-serif text-2xl font-semibold">Join the list</h3>
      <p className="mt-1 text-sm text-muted">New drops, restocks and private sale access — no noise.</p>
      {state === 'done' ? (
        <p className="mt-4 text-sm text-gold">You're on the list. Welcome.</p>
      ) : (
        <div className="mt-4 flex border border-ink">
          <input
            className="w-full bg-transparent px-4 py-3 text-sm outline-none"
            placeholder="Email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === 'err') setState('idle');
            }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <button onClick={submit} className="flex shrink-0 items-center gap-2 bg-ink px-5 text-[11px] uppercase tracking-label text-white hover:bg-gold">
            {state === 'busy' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
          </button>
        </div>
      )}
      {state === 'err' && <p className="mt-2 text-xs text-henna">Enter a valid email address to subscribe.</p>}
    </div>
  );
}

/* ---------------- footer + floating WhatsApp ---------------- */
export function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent('Hello! I have a question about a piece on your website.')}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-white shadow-lg transition-colors hover:bg-gold"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden text-[11px] uppercase tracking-label sm:inline">Chat with us</span>
    </a>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-paper">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-2xl font-semibold tracking-[0.2em]">{brand.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Handcrafted formals, pret and bridal wear — made slowly by master artisans, delivered worldwide.
          </p>
          <div className="mt-4 flex gap-4 text-[11px] uppercase tracking-label">
            <a className="hover:text-gold" href={brand.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a className="hover:text-gold" href={brand.facebook} target="_blank" rel="noreferrer">Facebook</a>
            <a className="hover:text-gold" href={brand.youtube} target="_blank" rel="noreferrer">YouTube</a>
          </div>
        </div>
        {footerMenus.slice(0, 2).map((m) => (
          <div key={m.title}>
            <p className="text-[11px] uppercase tracking-label text-muted">{m.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {m.links.map((l) => (
                <li key={l.to + l.label}>
                  <Link className="hover:text-gold" to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="text-[11px] uppercase tracking-label text-muted">Contact</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a className="hover:text-gold" href={`https://wa.me/${brand.whatsapp}`} target="_blank" rel="noreferrer">
                WhatsApp: {brand.phoneDisplay}
              </a>
            </li>
            <li>
              <a className="hover:text-gold" href={`mailto:${brand.email}`}>{brand.email}</a>
            </li>
            <li className="text-muted">{brand.address}</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Visa', 'Mastercard', 'COD', 'Bank Transfer'].map((m) => (
              <span key={m} className="border border-line px-2.5 py-1 text-[10px] uppercase tracking-label text-muted">{m}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-line px-5 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {brand.name}. Demo store — all products and imagery are placeholders.
      </div>
    </footer>
  );
}

