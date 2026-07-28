/* Catalog provider — one interface, two sources:
   - Mock mode (default): products come from the local Node backend.
   - Shopify mode: set VITE_SHOPIFY_DOMAIN + VITE_SHOPIFY_STOREFRONT_TOKEN
     in .env and the same functions pull live Shopify data instead. */
import { apiGet } from './api';
import { collectionMeta } from '../data/site';
import { shopifyEnabled, shopifyProducts, shopifyProduct, shopifyCollection } from './shopify';
import type { Product } from './types';

export const usingShopify = shopifyEnabled;

export type Sort = 'featured' | 'price-asc' | 'price-desc' | 'newest';

function sortList(list: Product[], sort: Sort): Product[] {
  const copy = [...list];
  if (sort === 'price-asc') copy.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') copy.sort((a, b) => b.price - a.price);
  else if (sort === 'newest') copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return copy;
}

export async function getProducts(opts: { collection?: string; q?: string; sort?: Sort; limit?: number } = {}): Promise<Product[]> {
  let list: Product[];
  if (usingShopify) {
    list = await shopifyProducts({ q: opts.q });
    if (opts.collection) list = list.filter((p) => p.collections.includes(opts.collection!));
  } else {
    const params = new URLSearchParams();
    if (opts.collection) params.set('collection', opts.collection);
    if (opts.q) params.set('q', opts.q);
    list = await apiGet<Product[]>(`/api/products?${params.toString()}`);
  }
  list = sortList(list, opts.sort || 'featured');
  return opts.limit ? list.slice(0, opts.limit) : list;
}

export async function getProduct(handle: string): Promise<Product | null> {
  if (usingShopify) return shopifyProduct(handle);
  try {
    return await apiGet<Product>(`/api/products/${handle}`);
  } catch {
    return null;
  }
}

export async function getCollection(handle: string): Promise<{ title: string; description: string; products: Product[] }> {
  if (usingShopify) {
    const c = await shopifyCollection(handle);
    if (c) return c;
  }
  const meta = collectionMeta(handle);
  const products = await getProducts({ collection: handle });
  return { title: meta.title, description: meta.blurb, products };
}
