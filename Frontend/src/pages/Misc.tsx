import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Minus, Plus, Trash2 } from 'lucide-react';
import { getProducts } from '../lib/catalog';
import type { Product } from '../lib/types';
import { useCart } from '../lib/cart';
import { money, ProductGrid, SmartImg } from '../ui';

/* ---------------- search ---------------- */
export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [input, setInput] = useState(q);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setInput(q);
    if (!q.trim()) {
      setItems([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    getProducts({ q })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => {
        setLoading(false);
        setSearched(true);
      });
  }, [q]);

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-12">
      <h1 className="text-center font-serif text-4xl font-semibold">Search</h1>
      <div className="mx-auto mt-6 flex max-w-xl border border-ink">
        <input
          autoFocus
          className="w-full bg-transparent px-4 py-3.5 outline-none"
          placeholder="Search pieces — e.g. bridal, lawn, silk…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setParams(input.trim() ? { q: input.trim() } : {})}
        />
        <button
          onClick={() => setParams(input.trim() ? { q: input.trim() } : {})}
          className="flex shrink-0 items-center gap-2 bg-ink px-6 text-[11px] uppercase tracking-label text-white hover:bg-gold"
        >
          <SearchIcon className="h-4 w-4" /> Search
        </button>
      </div>
      <div className="pt-10">
        {loading ? (
          <p className="text-center text-muted">Searching…</p>
        ) : searched && items.length === 0 ? (
          <p className="text-center text-muted">No pieces matched "{q}". Try a fabric, colour or collection name.</p>
        ) : items.length > 0 ? (
          <>
            <p className="mb-6 text-center text-xs uppercase tracking-label text-muted">{items.length} results for "{q}"</p>
            <ProductGrid items={items} />
          </>
        ) : (
          <p className="text-center text-sm text-muted">Type what you're looking for and press Enter.</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- cart page ---------------- */
export function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-center font-serif text-4xl font-semibold">Your bag</h1>
      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted">Your bag is empty.</p>
          <Link to="/collections/new-arrivals" className="mt-5 inline-block border border-ink px-8 py-3 text-[11px] uppercase tracking-label hover:bg-ink hover:text-white">
            Shop new arrivals
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {items.map((it) => (
              <div key={it.handle + it.size} className="flex gap-4 py-5">
                <Link to={`/products/${it.handle}`} className="h-28 w-[84px] shrink-0 overflow-hidden bg-line/40" style={{ containerType: 'inline-size' }}>
                  <SmartImg src={it.image} seed={it.handle} alt={it.title} className="h-full w-full" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/products/${it.handle}`} className="font-serif text-xl leading-tight hover:text-gold">{it.title}</Link>
                      <p className="mt-0.5 text-xs text-muted">Size: {it.size}</p>
                    </div>
                    <button aria-label="Remove" onClick={() => remove(it.handle, it.size)} className="text-muted hover:text-henna">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center border border-line">
                      <button aria-label="Decrease" className="grid h-9 w-9 place-items-center hover:bg-ivory" onClick={() => setQty(it.handle, it.size, it.qty - 1)}>
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{it.qty}</span>
                      <button aria-label="Increase" className="grid h-9 w-9 place-items-center hover:bg-ivory" onClick={() => setQty(it.handle, it.size, it.qty + 1)}>
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-medium">{money(it.price * it.qty)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-label text-muted">Subtotal</span>
            <span className="font-serif text-2xl font-semibold">{money(subtotal)}</span>
          </div>
          <p className="mt-1 text-right text-xs text-muted">Shipping calculated at checkout · free above {money(5000)} in Pakistan</p>
          <Link to="/checkout" className="mt-5 block bg-ink py-4 text-center text-[11px] uppercase tracking-label text-white hover:bg-gold">
            Proceed to checkout
          </Link>
        </>
      )}
    </div>
  );
}

/* ---------------- 404 ---------------- */
export function NotFound() {
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-28 text-center">
      <p className="text-[11px] uppercase tracking-label text-muted">404</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">This page has wandered off.</h1>
      <Link to="/" className="mt-7 inline-block border border-ink px-8 py-3 text-[11px] uppercase tracking-label hover:bg-ink hover:text-white">
        Back to home
      </Link>
    </div>
  );
}
