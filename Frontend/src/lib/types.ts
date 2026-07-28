export interface Variant {
  /** Shopify GID when in Shopify mode; undefined in mock mode */
  id?: string;
  size: string;
  available: boolean;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  collection: string;          // primary collection handle
  collections: string[];       // all collection handles this product belongs to
  price: number;               // PKR
  compareAt?: number | null;   // original price when on sale
  images: string[];            // absolute or /images/... urls; may be empty (placeholder art renders)
  variants: Variant[];
  tags: string[];              // 'express' | 'new' | 'bestseller' | ...
  soldOut?: boolean;
  description: string;
  fabric?: string;
  createdAt: string;
}

export interface CartItem {
  handle: string;
  title: string;
  price: number;
  size: string;
  qty: number;
  image?: string;
  variantId?: string; // present in Shopify mode → enables Shopify checkout
}
