import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { readJson, writeJson, exists } from './db.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 5001);
const ADMIN_KEY = process.env.ADMIN_KEY || 'mahru-admin-2026';

/* ---------------- seed catalog (original demo products) ---------------- */
const STITCHED = ['XS', 'S', 'M', 'L', 'XL'];
const day = (n) => new Date(Date.UTC(2026, 5, 30) - n * 86400000).toISOString();
let seq = 0;

function P(handle, title, collection, price, compareAt, description, tags = [], opts = {}) {
    seq += 1;
    const sizes = opts.sizes || STITCHED;
    const collections = [collection];
    if (compareAt && compareAt > price) collections.push('sale');
    if (tags.includes('new')) collections.push('new-arrivals');
    if (tags.includes('bestseller')) collections.push('best-sellers');
    return {
        id: `demo-${seq}`,
        handle,
        title,
        collection,
        collections,
        price,
        compareAt: compareAt || null,
        images: [`/images/products/${handle}/1.jpg`], // put photos in frontend/public/images/products/<handle>/ named 1.jpg, 2.jpg, 3.jpg ...
        variants: sizes.map((s) => ({ size: s, available: !opts.soldOut })),
        tags,
        soldOut: !!opts.soldOut,
        description,
        fabric: opts.fabric || null,
        createdAt: day(opts.age ?? seq),
    };
}

const DEFAULT_PRODUCTS = [
    // formals
    P('gulbahar', 'Gulbahar', 'formals', 38950, null, 'Hand-embellished organza shirt with resham jaal, paired with a sequinned dupatta and raw-silk trousers.', ['new', 'express'], { fabric: 'Organza · Raw silk', age: 1 }),
    P('mahjabeen', 'Mahjabeen', 'formals', 34500, null, 'Chiffon angrakha with antique-gold tilla work and a scalloped hem, finished with a mukesh dupatta.', ['bestseller'], { fabric: 'Chiffon', age: 6 }),
    P('nooraniyat', 'Nooraniyat', 'formals', 36950, null, 'Ivory net ensemble with pearl detailing and delicate kora embroidery along the neckline.', ['new'], { fabric: 'Net · Grip silk', age: 2 }),
    P('dilnasheen', 'Dilnasheen', 'formals', 29950, 35950, 'Deep emerald shirt with mirror-work motifs, plain shalwar and a contrast organza dupatta.', ['express'], { fabric: 'Khaadi net', age: 12 }),
    P('zarnigar', 'Zarnigar', 'formals', 39950, null, 'Fully hand-worked front with zardozi and dabka, teamed with an embroidered-border dupatta.', ['bestseller'], { fabric: 'Organza', age: 9 }),
    P('shabnam', 'Shabnam', 'formals', 28500, null, 'Powder-blue crinkle chiffon with silver gota lines and a matching gharara.', [], { fabric: 'Crinkle chiffon', age: 16 }),
    // luxury formals
    P('sheesh-mahal', 'Sheesh Mahal', 'luxury-formals', 74500, null, 'Couture-grade mirror and dabka work over pure organza — over 400 hours of handwork.', ['new'], { fabric: 'Pure organza', age: 3 }),
    P('noor-e-jahan', 'Noor-e-Jahan', 'luxury-formals', 68000, null, 'Regal maroon raw silk with full zardozi front, heavy borders and a four-sided worked dupatta.', ['bestseller'], { fabric: 'Raw silk', age: 8 }),
    P('taj-posh', 'Taj Posh', 'luxury-formals', 59500, null, 'Champagne tissue ensemble with antique sitara spray and hand-finished scallops.', [], { fabric: 'Tissue', age: 14 }),
    P('mehr-un-nisa', 'Mehr-un-Nisa', 'luxury-formals', 47500, 55000, 'Blush pink net with 3D floral appliqué, pearl strings and a farshi-style trouser.', [], { fabric: 'Net', age: 18 }),
    // silk pret
    P('feroza', 'Feroza', 'silk-pret', 18950, null, 'Turquoise pure-silk kurta with a hand-blocked border and side slits, ready to wear.', ['new'], { fabric: 'Pure silk', age: 4 }),
    P('raat-ki-rani', 'Raat ki Rani', 'silk-pret', 21500, null, 'Midnight silk co-ord kurta with tone-on-tone embroidery — our quiet best seller.', ['bestseller', 'express'], { fabric: 'Charmeuse silk', age: 7 }),
    P('kundan', 'Kundan', 'silk-pret', 16950, 19950, 'Rust silk kurta with kundan buttons and a straight-cut trouser.', [], { fabric: 'Raw silk blend', age: 20 }),
    // formal pret
    P('chandni-raat', 'Chandni Raat', 'formal-pret', 15950, 21500, 'Silver-grey embroidered pret with mukesh sprinkle, fully lined and finished.', ['bestseller', 'express'], { fabric: 'Chiffon · Lined', age: 5 }),
    P('gul-e-rana', 'Gul-e-Rana', 'formal-pret', 13950, 17950, 'Tea-rose shirt with floral resham embroidery and pearl cuff detail.', ['express'], { fabric: 'Grip', age: 11 }),
    P('sitara-begum', 'Sitara Begum', 'formal-pret', 14950, 18500, 'Black pret with scattered sitara work — the reliable dinner-party answer.', [], { fabric: 'Georgette', age: 15 }),
    P('anaar-kali', 'Anaar Kali', 'formal-pret', 17500, null, 'Pomegranate-red frock-style pret with churidar and a light net dupatta.', ['new'], { fabric: 'Net · Silk lining', age: 2 }),
    // lawn pret
    P('sitara', 'Sitara', 'lawn-pret', 8950, null, 'Everyday printed lawn two-piece with embroidered neckline, pre-stitched and breezy.', ['bestseller', 'express'], { fabric: 'Premium lawn', age: 5 }),
    P('bahaar', 'Bahaar', 'lawn-pret', 7990, 9990, 'Spring-print lawn kurta with lace inserts — soft, washed and ready to wear.', ['express'], { fabric: 'Lawn', age: 13 }),
    P('dhoop-chaaon', 'Dhoop Chaaon', 'lawn-pret', 9990, null, 'Two-tone lawn co-ord with chikankari-style embroidery on the sleeves.', ['new'], { fabric: 'Lawn', age: 3 }),
    // unstitched lawn
    P('champa', 'Champa', 'unstitched-lawn', 4450, null, 'Three-piece unstitched lawn: printed shirt, dyed trouser and a voile dupatta.', ['express'], { sizes: ['Unstitched'], fabric: 'Lawn · Voile', age: 10 }),
    P('genda-phool', 'Genda Phool', 'unstitched-lawn', 4450, 5950, 'Marigold print with an embroidered front panel — tailor it your way.', [], { sizes: ['Unstitched'], fabric: 'Lawn', age: 17 }),
    P('neelam', 'Neelam', 'unstitched-lawn', 4450, null, 'Sapphire-blue signature print with a jacquard dupatta.', ['new'], { sizes: ['Unstitched'], fabric: 'Lawn · Jacquard', age: 4 }),
    // co-ords
    P('subh-o-shaam', 'Subh-o-Shaam', 'co-ords', 12950, null, 'Relaxed linen-blend co-ord set in oat — from morning chai to evening plans.', ['new'], { fabric: 'Linen blend', age: 6 }),
    P('reshmi', 'Reshmi', 'co-ords', 14500, null, 'Satin co-ord with a boxy shirt and wide trouser, quietly polished.', [], { fabric: 'Satin', age: 19 }),
    // bridal
    P('mehr-e-taban', 'Mehr-e-Taban', 'bridal', 285000, null, 'Deep-red bridal lehnga with full zardozi, dabka and kora handwork — made to order over 8–10 weeks.', ['bestseller'], { sizes: ['Made to order'], fabric: 'Raw silk · Organza', age: 21 }),
    P('shahzadi', 'Shahzadi', 'bridal', 398000, null, 'Heirloom-grade walima ensemble in ivory-gold tissue with hand-set pearls.', [], { sizes: ['Made to order'], fabric: 'Tissue · Pure organza', age: 25 }),
    P('rani-haar', 'Rani Haar', 'bridal', 175000, null, 'Mehndi-day gharara in sunshine gota work with a heavily finished dupatta.', ['new'], { sizes: ['Made to order'], fabric: 'Kamkhaab · Net', age: 8 }),
    P('noor-mahal', 'Noor Mahal', 'bridal', 325000, null, 'Blush-and-gold bridal with cascading floral zardozi — currently reserved.', [], { sizes: ['Made to order'], soldOut: true, fabric: 'Organza', age: 23 }),
];

if (!exists('products')) writeJson('products', DEFAULT_PRODUCTS);
for (const name of['orders', 'newsletter', 'contact'])
    if (!exists(name)) writeJson(name, []);

const catalog = () => readJson('products', DEFAULT_PRODUCTS);

/* ---------------- routes ---------------- */
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'mahru-backend' }));

app.get('/api/products', (req, res) => {
    let list = catalog();
    const { collection, q } = req.query;
    if (collection) list = list.filter((p) => p.collections.includes(String(collection)));
    if (q) {
        const needle = String(q).toLowerCase();
        list = list.filter(
            (p) =>
            p.title.toLowerCase().includes(needle) ||
            p.description.toLowerCase().includes(needle) ||
            (p.fabric || '').toLowerCase().includes(needle) ||
            p.collections.some((c) => c.includes(needle)),
        );
    }
    res.json(list);
});

app.get('/api/products/:handle', (req, res) => {
    const p = catalog().find((x) => x.handle === req.params.handle);
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json(p);
});

const FREE_OVER = 5000;
const FLAT_SHIP = 350;

app.post('/api/orders', (req, res) => {
    const { customer, paymentMethod, items } = req.body || {};
    if (!customer ? .name ? .trim() || !customer ? .phone ? .trim() || !customer ? .address ? .trim() || !customer ? .city ? .trim())
        return res.status(400).json({ error: 'Name, phone, address and city are required.' });
    if (!['COD', 'Bank Transfer'].includes(paymentMethod))
        return res.status(400).json({ error: 'Please choose a payment method.' });
    if (!Array.isArray(items) || items.length === 0)
        return res.status(400).json({ error: 'Your bag is empty.' });

    const byHandle = Object.fromEntries(catalog().map((p) => [p.handle, p]));
    const lines = [];
    for (const it of items) {
        const p = byHandle[it.handle];
        const qty = Number(it.qty);
        if (!p) return res.status(400).json({ error: `Unknown product: ${it.handle}` });
        if (p.soldOut) return res.status(400).json({ error: `${p.title} is sold out.` });
        if (!Number.isInteger(qty) || qty < 1 || qty > 10)
            return res.status(400).json({ error: 'Quantities must be between 1 and 10.' });
        lines.push({ handle: p.handle, title: p.title, size: String(it.size || ''), qty, price: p.price, lineTotal: p.price * qty });
    }
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const shipping = subtotal >= FREE_OVER ? 0 : FLAT_SHIP;
    const order = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        status: 'Pending',
        paymentMethod,
        customer: {
            name: String(customer.name).trim(),
            phone: String(customer.phone).trim(),
            email: String(customer.email || '').trim(),
            address: String(customer.address).trim(),
            city: String(customer.city).trim(),
            notes: String(customer.notes || '').trim(),
        },
        items: lines,
        subtotal,
        shipping,
        total: subtotal + shipping,
    };
    const orders = readJson('orders', []);
    orders.unshift(order);
    writeJson('orders', orders);
    res.status(201).json({ ok: true, id: order.id, total: order.total });
});

app.get('/api/orders', (req, res) => {
    if (req.headers['x-admin-key'] !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
    res.json(readJson('orders', []));
});

app.post('/api/newsletter', (req, res) => {
    const email = String(req.body ? .email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    const list = readJson('newsletter', []);
    if (!list.some((x) => x.email === email)) {
        list.push({ email, at: new Date().toISOString() });
        writeJson('newsletter', list);
    }
    res.json({ ok: true });
});

app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body || {};
    if (!String(name || '').trim() || !String(message || '').trim())
        return res.status(400).json({ error: 'Name and message are required.' });
    const list = readJson('contact', []);
    list.unshift({
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        name: String(name).trim(),
        email: String(email || '').trim(),
        message: String(message).trim(),
    });
    writeJson('contact', list);
    res.json({ ok: true });
});

const __dirname = path.dirname(fileURLToPath(
    import.meta.url));
const DIST = path.join(__dirname, '..', 'Frontend', 'dist');

if (fs.existsSync(DIST)) {
    app.use(express.static(DIST));

    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) return next();
        res.sendFile(path.join(DIST, 'index.html'));
    });
}

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () =>
    console.log(`MAHRU running on http://localhost:${PORT}` +
        (fs.existsSync(DIST) ? ' (serving frontend + API)' : ' (API only - no frontend build found)')));
