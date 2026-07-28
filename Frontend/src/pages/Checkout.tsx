import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, MessageCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../lib/cart';
import { apiPost } from '../lib/api';
import { usingShopify } from '../lib/catalog';
import { shopifyCheckoutUrl } from '../lib/shopify';
import { brand } from '../data/site';
import { money, SmartImg } from '../ui';

const FREE_OVER = 5000;
const FLAT_SHIP = 350;

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', notes: '' });
  const [method, setMethod] = useState<'COD' | 'Bank Transfer' | ''>('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string; total: number } | null>(null);

  const shipping = subtotal >= FREE_OVER ? 0 : FLAT_SHIP;
  const total = subtotal + shipping;
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const input = 'w-full border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-ink';

  const shopifyReady = usingShopify && items.length > 0 && items.every((i) => i.variantId);

  const payViaShopify = async () => {
    setBusy(true);
    setErr('');
    try {
      const url = await shopifyCheckoutUrl(items);
      window.location.href = url; // Shopify's secure hosted checkout takes over
    } catch (e) {
      setErr('Could not open the Shopify checkout. You can still order below and pay on delivery or by bank transfer.');
      setBusy(false);
    }
  };

  const submit = async () => {
    if (items.length === 0) return setErr('Your bag is empty.');
    if (!form.name.trim()) return setErr('Please enter your full name.');
    if (!form.phone.trim()) return setErr('Please enter your phone / WhatsApp number.');
    if (!form.address.trim()) return setErr('Please enter your delivery address.');
    if (!form.city.trim()) return setErr('Please enter your city.');
    if (!method) return setErr('Please choose how you would like to pay.');
    setErr('');
    setBusy(true);
    try {
      const r = await apiPost<{ ok: boolean; id: string; total: number; error?: string }>('/api/orders', {
        customer: form,
        paymentMethod: method,
        items: items.map((i) => ({ handle: i.handle, size: i.size, qty: i.qty })),
      });
      if (!r.ok) setErr((r.data as { error?: string }).error || 'Could not place the order. Please try again.');
      else {
        setDone({ id: r.data.id, total: r.data.total });
        clear();
      }
    } catch {
      setErr('Could not reach the server. Make sure the backend is running, then try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div className="mx-auto max-w-xl px-5 py-20 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
        <h1 className="mt-4 font-serif text-4xl font-semibold">Shukriya, {form.name.split(' ')[0]}.</h1>
        <p className="mt-3 text-ink/75">
          Your order <span className="font-medium">#{done.id.slice(0, 8).toUpperCase()}</span> for{' '}
          <span className="font-medium">{money(done.total)}</span> has been received. Our team will confirm it on
          WhatsApp shortly{method === 'Bank Transfer' ? ' and share the bank details for your transfer' : ''}.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3">
          <a
            href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(`Hello! I just placed order #${done.id.slice(0, 8).toUpperCase()} (${money(done.total)}) on your website.`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-ink px-8 py-3.5 text-[11px] uppercase tracking-label text-white hover:bg-gold"
          >
            <MessageCircle className="h-4 w-4" /> Message us on WhatsApp
          </a>
          <button onClick={() => navigate('/')} className="text-xs text-muted underline underline-offset-2 hover:text-gold">
            Continue shopping
          </button>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-12">
      <h1 className="text-center font-serif text-4xl font-semibold">Checkout</h1>
      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted">Your bag is empty.</p>
          <Link to="/" className="mt-5 inline-block border border-ink px-8 py-3 text-[11px] uppercase tracking-label hover:bg-ink hover:text-white">
            Back to shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          {/* form */}
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-label text-muted">Delivery details</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className={input} placeholder="Full name *" value={form.name} onChange={(e) => set('name', e.target.value)} />
                <input className={input} placeholder="Phone / WhatsApp *" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </div>
              <input className={`${input} mt-3`} placeholder="Email (for order updates)" value={form.email} onChange={(e) => set('email', e.target.value)} />
              <input className={`${input} mt-3`} placeholder="Delivery address *" value={form.address} onChange={(e) => set('address', e.target.value)} />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input className={input} placeholder="City *" value={form.city} onChange={(e) => set('city', e.target.value)} />
                <input className={input} placeholder="Notes (optional)" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
              </div>
            </div>

            <div>
              <p className="mb-3 text-[11px] uppercase tracking-label text-muted">Payment</p>
              {shopifyReady && (
                <button
                  onClick={payViaShopify}
                  disabled={busy}
                  className="mb-3 flex w-full items-center justify-center gap-2 bg-gold py-3.5 text-[11px] uppercase tracking-label text-white hover:bg-ink disabled:opacity-50"
                >
                  <ShieldCheck className="h-4 w-4" /> Pay securely via Shopify checkout
                </button>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {(['COD', 'Bank Transfer'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMethod(m);
                      setErr('');
                    }}
                    className={`border px-4 py-3.5 text-left transition-colors ${method === m ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink'}`}
                  >
                    <span className="block text-[11px] uppercase tracking-label">{m === 'COD' ? 'Cash on delivery' : 'Bank transfer'}</span>
                    <span className={`mt-0.5 block text-xs ${method === m ? 'text-white/70' : 'text-muted'}`}>
                      {m === 'COD' ? 'Pay the courier at your door.' : 'We share account details on WhatsApp after you order.'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {err && <p className="border border-henna/30 bg-henna/5 px-4 py-3 text-sm text-henna">{err}</p>}
            <button
              onClick={submit}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 bg-ink py-4 text-[11px] uppercase tracking-label text-white transition-colors hover:bg-gold disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Place order · {money(total)}
            </button>
            <p className="text-center text-xs text-muted">Every order is confirmed personally on WhatsApp before dispatch.</p>
          </div>

          {/* summary */}
          <aside className="h-fit border border-line bg-paper p-5 lg:sticky lg:top-28">
            <p className="text-[11px] uppercase tracking-label text-muted">Order summary</p>
            <div className="mt-4 divide-y divide-line">
              {items.map((it) => (
                <div key={it.handle + it.size} className="flex items-center gap-3 py-3">
                  <div className="h-16 w-12 shrink-0 overflow-hidden bg-line/40" style={{ containerType: 'inline-size' }}>
                    <SmartImg src={it.image} seed={it.handle} alt={it.title} className="h-full w-full" />
                  </div>
                  <div className="flex-1">
                    <p className="font-serif leading-tight">{it.title}</p>
                    <p className="text-xs text-muted">{it.size} · Qty {it.qty}</p>
                  </div>
                  <span className="text-sm">{money(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{money(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{shipping === 0 ? 'Free' : money(shipping)}</span></div>
              <div className="flex justify-between pt-1.5 font-serif text-xl font-semibold"><span>Total</span><span>{money(total)}</span></div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
