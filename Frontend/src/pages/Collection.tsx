import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCollection, Sort } from '../lib/catalog';
import type { Product } from '../lib/types';
import { ProductGrid } from '../ui';

export default function Collection() {
  const { handle = '' } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<Sort>('featured');

  useEffect(() => {
    setLoading(true);
    getCollection(handle)
      .then((c) => {
        setTitle(c.title);
        setDescription(c.description);
        setItems(c.products);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [handle]);

  const sorted = (() => {
    const copy = [...items];
    if (sort === 'price-asc') copy.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') copy.sort((a, b) => b.price - a.price);
    else if (sort === 'newest') copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return copy;
  })();

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-10">
      <header className="border-b border-line pb-8 text-center">
        <h1 className="font-serif text-4xl font-semibold sm:text-5xl">{title || '…'}</h1>
        {description && <p className="mx-auto mt-2 max-w-xl text-sm text-muted">{description}</p>}
      </header>

      <div className="flex items-center justify-between py-5">
        <p className="text-xs uppercase tracking-label text-muted">{loading ? 'Loading…' : `${sorted.length} pieces`}</p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="border border-line bg-paper px-3 py-2 text-xs uppercase tracking-label outline-none"
          aria-label="Sort products"
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-product animate-pulse bg-line/60" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="py-20 text-center text-muted">Nothing here yet — new pieces are on their way.</p>
      ) : (
        <ProductGrid items={sorted} />
      )}
    </div>
  );
}
