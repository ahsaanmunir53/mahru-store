/* ============================================================
   Shopify Storefront API client (headless mode).

   Activate by setting in .env:
     VITE_SHOPIFY_DOMAIN=your-store.myshopify.com
     VITE_SHOPIFY_STOREFRONT_TOKEN=xxxxxxxxxxxx

   Token: Shopify admin → Settings → Apps and sales channels →
   Develop apps → Create app → Configure Storefront API scopes
   (unauthenticated_read_product_listings, unauthenticated_write_checkouts,
   unauthenticated_read_product_inventory) → Install → copy the
   Storefront API access token.
   ============================================================ */
import type { Product, Variant, CartItem } from './types';

const DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN as string | undefined;
const TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN as string | undefined;
const API_VERSION = '2024-10';

export const shopifyEnabled = !!(DOMAIN && TOKEN);

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN as string,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  tags
  availableForSale
  createdAt
  images(first: 6) { edges { node { url } } }
  priceRange { minVariantPrice { amount } }
  compareAtPriceRange { minVariantPrice { amount } }
  variants(first: 25) { edges { node { id title availableForSale } } }
  collections(first: 10) { edges { node { handle } } }
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(n: any): Product {
  const price = Math.round(parseFloat(n.priceRange?.minVariantPrice?.amount || '0'));
  const compareRaw = parseFloat(n.compareAtPriceRange?.minVariantPrice?.amount || '0');
  const compareAt = compareRaw > price ? Math.round(compareRaw) : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants: Variant[] = (n.variants?.edges || []).map((e: any) => ({
    id: e.node.id,
    size: e.node.title === 'Default Title' ? 'One Size' : e.node.title,
    available: !!e.node.availableForSale,
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collections: string[] = (n.collections?.edges || []).map((e: any) => e.node.handle);
  return {
    id: n.id,
    handle: n.handle,
    title: n.title,
    collection: collections[0] || 'all',
    collections,
    price,
    compareAt,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    images: (n.images?.edges || []).map((e: any) => e.node.url),
    variants: variants.length ? variants : [{ size: 'One Size', available: !!n.availableForSale }],
    tags: (n.tags || []).map((t: string) => t.toLowerCase()),
    soldOut: !n.availableForSale,
    description: n.description || '',
    createdAt: n.createdAt,
  };
}

export async function shopifyProducts(opts: { q?: string; first?: number } = {}): Promise<Product[]> {
  const data = await gql<{ products: { edges: { node: unknown }[] } }>(
    `query Products($first: Int!, $query: String) {
       products(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {
         edges { node { ${PRODUCT_FIELDS} } }
       }
     }`,
    { first: opts.first ?? 60, query: opts.q || null },
  );
  return data.products.edges.map((e) => mapProduct(e.node));
}

export async function shopifyProduct(handle: string): Promise<Product | null> {
  const data = await gql<{ product: unknown | null }>(
    `query Product($handle: String!) {
       product(handle: $handle) { ${PRODUCT_FIELDS} }
     }`,
    { handle },
  );
  return data.product ? mapProduct(data.product) : null;
}

export async function shopifyCollection(handle: string): Promise<{ title: string; description: string; products: Product[] } | null> {
  const data = await gql<{ collection: { title: string; description: string; products: { edges: { node: unknown }[] } } | null }>(
    `query Collection($handle: String!) {
       collection(handle: $handle) {
         title
         description
         products(first: 60) { edges { node { ${PRODUCT_FIELDS} } } }
       }
     }`,
    { handle },
  );
  if (!data.collection) return null;
  return {
    title: data.collection.title,
    description: data.collection.description || '',
    products: data.collection.products.edges.map((e) => mapProduct(e.node)),
  };
}

/** Creates a Shopify cart from local cart items and returns the hosted checkout URL. */
export async function shopifyCheckoutUrl(items: CartItem[]): Promise<string> {
  const lines = items
    .filter((i) => i.variantId)
    .map((i) => ({ merchandiseId: i.variantId, quantity: i.qty }));
  if (!lines.length) throw new Error('No Shopify variant ids in cart.');
  const data = await gql<{ cartCreate: { cart: { checkoutUrl: string } | null; userErrors: { message: string }[] } }>(
    `mutation CartCreate($lines: [CartLineInput!]!) {
       cartCreate(input: { lines: $lines }) {
         cart { checkoutUrl }
         userErrors { message }
       }
     }`,
    { lines },
  );
  if (data.cartCreate.userErrors?.length) throw new Error(data.cartCreate.userErrors[0].message);
  if (!data.cartCreate.cart) throw new Error('Could not create the Shopify cart.');
  return data.cartCreate.cart.checkoutUrl;
}
