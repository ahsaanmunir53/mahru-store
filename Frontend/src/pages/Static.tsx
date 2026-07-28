import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, Loader2, MessageCircle } from 'lucide-react';
import { brand, pages, PageBlock } from '../data/site';
import { apiPost } from '../lib/api';
import { NotFound } from './Misc';

function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f, i) => (
        <div key={f.q}>
          <button className="flex w-full items-center justify-between gap-4 py-4 text-left" onClick={() => setOpen(open === i ? null : i)}>
            <span className="font-medium">{f.q}</span>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && <p className="pb-5 text-sm leading-relaxed text-ink/75">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const [err, setErr] = useState('');
  const input = 'w-full border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-ink';
  const submit = async () => {
    if (!form.name.trim() || !form.message.trim()) return setErr('Please add your name and a message.');
    setErr('');
    setState('busy');
    try {
      const r = await apiPost('/api/contact', form);
      if (r.ok) setState('done');
      else {
        setErr('Could not send right now — please message us on WhatsApp instead.');
        setState('idle');
      }
    } catch {
      setErr('Could not reach the server — please message us on WhatsApp instead.');
      setState('idle');
    }
  };
  if (state === 'done')
    return <p className="border border-gold/40 bg-gold/5 px-4 py-4 text-sm">Thank you — your message is in. We reply within a working day.</p>;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={input} placeholder="Your name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={input} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <textarea className={input} rows={5} placeholder="How can we help? *" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      {err && <p className="text-sm text-henna">{err}</p>}
      <div className="flex flex-wrap gap-3">
        <button onClick={submit} className="flex items-center gap-2 bg-ink px-8 py-3.5 text-[11px] uppercase tracking-label text-white hover:bg-gold">
          {state === 'busy' && <Loader2 className="h-4 w-4 animate-spin" />} Send message
        </button>
        <a
          href={`https://wa.me/${brand.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 border border-ink px-8 py-3.5 text-[11px] uppercase tracking-label hover:bg-ink hover:text-white"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp us
        </a>
      </div>
      <p className="text-xs text-muted">
        {brand.email} · {brand.phoneDisplay} · {brand.address}
      </p>
    </div>
  );
}

function Block({ b }: { b: PageBlock }) {
  if ('faq' in b) return <Faq items={b.faq} />;
  if ('table' in b)
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border border-line text-sm">
          <thead>
            <tr className="bg-paper">
              {b.table.head.map((h) => (
                <th key={h} className="border-b border-line px-4 py-3 text-left text-[11px] uppercase tracking-label text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {b.table.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) => (
                  <td key={i} className={`px-4 py-3 ${i === 0 ? 'font-medium' : 'text-ink/75'}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold">{b.h}</h2>
      <p className="mt-2 leading-relaxed text-ink/75">{b.p}</p>
    </div>
  );
}

export default function StaticPage() {
  const { handle = '' } = useParams();
  const page = pages[handle];
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [handle]);
  if (!page) return <NotFound />;
  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <nav className="mb-4 text-center text-xs text-muted">
        <Link to="/" className="hover:text-gold">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{page.title}</span>
      </nav>
      <h1 className="text-center font-serif text-4xl font-semibold sm:text-5xl">{page.title}</h1>
      {page.intro && <p className="mx-auto mt-3 max-w-xl text-center text-ink/70">{page.intro}</p>}
      <div className="mt-10 space-y-9">
        {page.blocks.map((b, i) => (
          <Block key={i} b={b} />
        ))}
        {handle === 'contact' && <ContactForm />}
      </div>
    </div>
  );
}
