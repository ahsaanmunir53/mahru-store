import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { collections, collectionMeta, hero, homeRows, reviews, reviewsSummary } from '../data/site';
import { getProducts } from '../lib/catalog';
import type { Product } from '../lib/types';
import { ProductCard, Reveal, SectionHead, SwatchArt, SmartImg, Stars, Newsletter } from '../ui';

export default function Home() {
  const [all, setAll] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getProducts({ limit: 200 })
      .then(setAll)
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, []);

  const inCollection = (handle: string, limit: number) =>
    all.filter((p) => p.collections.includes(handle)).slice(0, limit);

  const tiles = collections.filter((c) => c.tile);

  // Real photo for a category tile = first product in that edit that has one.
  const categoryImage = (handle: string): string | undefined => {
    const p = all.find((x) => x.collections.includes(handle) && x.images[0]);
    return p?.images[0];
  };

  // Hero banner photo: prefer a bridal/luxury piece, else the first product with a photo.
  const heroImage =
    categoryImage('bridal') ||
    categoryImage('luxury-formals') ||
    all.find((p) => p.images[0])?.images[0];

  return (
    <div>
      {/* hero — full-width banner, like a campaign cover */}
      <section className="relative w-full">
        <div className="relative h-[64vh] min-h-[460px] w-full overflow-hidden">
          {/* background image: a real product photo, swatch fallback if missing */}
          <SmartImg
            src={heroImage}
            seed="mahru-hero-banner"
            alt="MAHRU festive edit"
            className="absolute inset-0 h-full w-full !object-cover"
          />
          {/* readability overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-ink/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />

          {/* overlaid copy */}
          <div className="relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-center px-6 sm:px-10">
            <Reveal>
              <p className="text-[11px] uppercase tracking-label text-white/85">{hero.eyebrow}</p>
              <h1 className="mt-4 max-w-2xl font-serif text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
                {hero.headline}
              </h1>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/80">{hero.sub}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to={hero.ctaTo} className="bg-white px-8 py-4 text-[11px] uppercase tracking-label text-ink transition-colors hover:bg-gold hover:text-white">
                  {hero.ctaLabel}
                </Link>
                <Link to={hero.cta2To} className="group inline-flex items-center gap-2 border border-white/60 px-8 py-4 text-[11px] uppercase tracking-label text-white transition-colors hover:bg-white hover:text-ink">
                  {hero.cta2Label}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
        {/* thin trust strip under the banner */}
        <div className="border-b border-line bg-paper">
          <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-center gap-x-10 gap-y-2 px-5 py-3 text-[11px] uppercase tracking-label text-muted">
            <span>Handcrafted in Lahore</span>
            <span className="hidden sm:inline">·</span>
            <span>Worldwide shipping</span>
            <span className="hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1.5"><Stars n={5} /> 4.9 / 5</span>
          </div>
        </div>
      </section>

      {/* shop by category — real photo from each edit */}
      <section className="mx-auto max-w-[1320px] px-5 pt-16">
        <SectionHead title="Shop by category" blurb="Nine edits, one standard of craft." />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {tiles.map((c, i) => (
            <Reveal key={c.handle} delay={Math.min(i, 6) * 50}>
              <Link to={`/collections/${c.handle}`} className="group relative block aspect-[4/5] overflow-hidden" style={{ containerType: 'inline-size' }}>
                <SmartImg
                  src={categoryImage(c.handle)}
                  seed={c.handle}
                  label={c.title}
                  alt={c.title}
                  className="h-full w-full transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="font-serif text-2xl font-semibold drop-shadow">{c.title}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-label opacity-90">
                    View designs <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* product rows */}
      {homeRows.map((row) => {
        const meta = collectionMeta(row.handle);
        const items = inCollection(row.handle, row.limit);
        if (!loading && items.length === 0) return null;
        return (
          <section key={row.handle} className="mx-auto max-w-[1320px] px-5 pt-14">
            <SectionHead title={meta.title} blurb={meta.blurb} to={`/collections/${row.handle}`} />
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-product animate-pulse bg-line/60" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-4">
                {items.map((p) => (
                  <ProductCard key={p.handle} p={p} />
                ))}
              </div>
            )}
            <Link
              to={`/collections/${row.handle}`}
              className="mt-6 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-label hover:text-gold sm:hidden"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        );
      })}

      {/* sale banner */}
      <section className="mx-auto max-w-[1320px] px-5 pt-16">
        <Link to="/collections/sale" className="group relative block overflow-hidden" style={{ containerType: 'inline-size' }}>
          <SwatchArt seed="sale-banner" className="h-52 w-full sm:h-64" />
          <div className="absolute inset-0 bg-ink/45 transition-colors group-hover:bg-ink/55" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
            <p className="text-[11px] uppercase tracking-label opacity-90">Limited stock</p>
            <p className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">The Sale Edit</p>
            <p className="mt-3 inline-flex items-center gap-1.5 border-b border-white/60 pb-0.5 text-[11px] uppercase tracking-label">
              Shop now <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>
        </Link>
      </section>

      {/* reviews wall */}
      <section className="mx-auto max-w-[1320px] px-5 pt-16">
        <SectionHead
          title="Let our customers speak"
          blurb={`${reviewsSummary.average} average from ${reviewsSummary.count}+ verified reviews.`}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.name + r.product} delay={Math.min(i, 6) * 40}>
              <figure className="flex h-full flex-col border border-line bg-paper p-5">
                <Stars n={r.stars} />
                {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                <blockquote className="mt-1.5 text-sm leading-relaxed text-ink/75">{r.body}</blockquote>
                <figcaption className="mt-auto pt-4 text-xs text-muted">
                  {r.name} · {r.date} ·{' '}
                  <Link to={`/products/${r.handle}`} className="underline decoration-line underline-offset-2 hover:text-gold">
                    {r.product}
                  </Link>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* newsletter */}
      <section className="mx-auto max-w-[1320px] border-t border-line px-5 py-16 mt-16">
        <Newsletter />
      </section>
    </div>
  );
}
