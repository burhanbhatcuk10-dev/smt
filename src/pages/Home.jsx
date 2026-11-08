import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { CONDITIONS, CATEGORIES, money, discount, waLink, avg, dateFmt } from "../utils.js";
import {
  IconPhone, IconPin, IconClock, IconMail, IconShield, IconCheck, IconTag, IconTools, IconLaptop,
  IconX, IconSearch, IconWhatsApp, Stars, StarInput, SocialIcon, socialLabel,
} from "../components/Icons.jsx";

function Placeholder() {
  return (
    <div className="ph" aria-hidden="true">
      <IconLaptop width={56} height={56} />
    </div>
  );
}

function CondBadge({ c }) {
  const info = CONDITIONS[c] || CONDITIONS.A;
  return <span className={"badge cond-" + info.tone}>{info.label}</span>;
}

function ProductCard({ p, rating, count, onOpen }) {
  const d = discount(p);
  return (
    <article className={"card" + (p.inStock ? "" : " sold")} onClick={() => onOpen(p)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpen(p)}>
      <div className="card-img">
        {p.images[0] ? <img src={p.images[0]} alt={p.name} loading="lazy" decoding="async" /> : <Placeholder />}
        <CondBadge c={p.condition} />
        {!p.inStock && <span className="oos">Sold out</span>}
        {d > 0 && p.inStock && <span className="off">{d}% off</span>}
      </div>
      <div className="card-body">
        <div className="card-cat">{p.brand ? p.brand + " · " : ""}{p.category}</div>
        <h3>{p.name}</h3>
        <div className="chips">
          {[p.processor, p.ram, p.storage].filter(Boolean).map((s) => (<span key={s}>{s}</span>))}
        </div>
        <div className="card-foot">
          <div>
            <div className="price">{money(p.price)}</div>
            {p.originalPrice > p.price && <div className="mrp">{money(p.originalPrice)}</div>}
          </div>
          {count > 0 && (
            <div className="mini-rate"><Stars value={rating} size={14} /> <small>({count})</small></div>
          )}
        </div>
      </div>
    </article>
  );
}

function ProductModal({ p, settings, reviews, onClose }) {
  const [img, setImg] = useState(0);
  const info = CONDITIONS[p.condition] || CONDITIONS.A;
  const d = discount(p);
  const specs = [
    ["Processor", p.processor], ["Memory (RAM)", p.ram], ["Storage", p.storage],
    ["Display", p.display], ["Other", p.extras], ["Warranty", p.warranty],
  ].filter((r) => r[1]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const msg = `Hello ${settings.shopName}, I'm interested in "${p.name}" (${info.label}) listed at ${money(p.price)}. Is it available?`;

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={p.name} onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close"><IconX /></button>
        <div className="modal-grid">
          <div className="gallery">
            <div className="gallery-main">
              {p.images[img] ? <img src={p.images[img]} alt={p.name} decoding="async" /> : <Placeholder />}
            </div>
            {p.images.length > 1 && (
              <div className="thumbs">
                {p.images.map((u, i) => (
                  <button key={u} className={i === img ? "on" : ""} onClick={() => setImg(i)}>
                    <img src={u} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="detail">
            <div className="detail-top"><CondBadge c={p.condition} />{!p.inStock && <span className="badge sold-b">Sold out</span>}</div>
            <h2>{p.name}</h2>
            {reviews.length > 0 && (
              <div className="mini-rate"><Stars value={avg(reviews)} /> <small>{avg(reviews).toFixed(1)} ({reviews.length} review{reviews.length > 1 ? "s" : ""})</small></div>
            )}
            <div className="price-row">
              <span className="price big">{money(p.price)}</span>
              {p.originalPrice > p.price && <span className="mrp">{money(p.originalPrice)}</span>}
              {d > 0 && <span className="save">Save {d}%</span>}
            </div>

            <div className={"cond-box cond-" + info.tone}>
              <strong>Condition: {info.label}</strong>
              <p>{info.desc}</p>
              {p.conditionNotes && <p className="notes"><b>Inspector's note:</b> {p.conditionNotes}</p>}
            </div>

            {p.description && <p className="desc">{p.description}</p>}

            {specs.length > 0 && (
              <table className="specs"><tbody>
                {specs.map(([k, v]) => (<tr key={k}><th>{k}</th><td>{v}</td></tr>))}
              </tbody></table>
            )}

            <div className="cta">
              <a className="btn wa" href={waLink(settings, msg)} target="_blank" rel="noopener noreferrer"><IconWhatsApp /> Enquire on WhatsApp</a>
              {settings.phone && <a className="btn ghost" href={`tel:${settings.phone}`}><IconPhone /> Call {settings.phone}</a>}
            </div>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="modal-reviews">
            <h3>Customer reviews for this product</h3>
            {reviews.slice(0, 4).map((r) => (
              <div className="rev" key={r.id}>
                <div className="rev-h"><b>{r.name}</b><Stars value={r.rating} size={14} /></div>
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewForm({ products }) {
  const [f, setF] = useState({ name: "", rating: 0, comment: "", productId: "" });
  const [state, setState] = useState({ busy: false, done: false, err: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, done: false, err: "" });
    try {
      await api.submitReview(f);
      setState({ busy: false, done: true, err: "" });
      setF({ name: "", rating: 0, comment: "", productId: "" });
    } catch (er) {
      setState({ busy: false, done: false, err: er.message });
    }
  }

  if (state.done)
    return (
      <div className="form-card thanks">
        <IconCheck width={40} height={40} />
        <h3>Thank you for your review!</h3>
        <p>It will appear on the website once it has been approved.</p>
        <button className="btn ghost" onClick={() => setState({ busy: false, done: false, err: "" })}>Write another</button>
      </div>
    );

  return (
    <form className="form-card" onSubmit={submit}>
      <h3>Share your experience</h3>
      <label>Your name<input value={f.name} onChange={set("name")} maxLength={60} required placeholder="e.g. Aamir Khan" /></label>
      <label>Rating<StarInput value={f.rating} onChange={(n) => setF({ ...f, rating: n })} /></label>
      <label>Product you bought (optional)
        <select value={f.productId} onChange={set("productId")}>
          <option value="">Not listed / general review</option>
          {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </select>
      </label>
      <label>Your review<textarea value={f.comment} onChange={set("comment")} rows={4} maxLength={1000} required placeholder="How was the laptop, the condition and our service?" /></label>
      {state.err && <div className="err">{state.err}</div>}
      <button className="btn primary" disabled={state.busy}>{state.busy ? "Sending..." : "Submit review"}</button>
    </form>
  );
}

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null);
  const [cat, setCat] = useState("All");
  const [cond, setCond] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");

  useEffect(() => {
    api.public().then(setData).catch(() => setError("Could not load the shop. Please refresh."));
  }, []);

  const settings = data?.settings;
  const products = data?.products || [];
  const reviews = data?.reviews || [];

  useEffect(() => {
    if (settings) document.title = `${settings.shopName} | New & Refurbished Laptops and Computers in Srinagar`;
  }, [settings]);

  const byProduct = useMemo(() => {
    const m = {};
    reviews.forEach((r) => r.productId && (m[r.productId] ||= []).push(r));
    return m;
  }, [reviews]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    let out = products.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      if (cond === "new" && p.condition !== "new") return false;
      if (cond === "refurb" && p.condition === "new") return false;
      if (t && !`${p.name} ${p.brand} ${p.processor} ${p.ram} ${p.storage}`.toLowerCase().includes(t)) return false;
      return true;
    });
    if (sort === "low") out = [...out].sort((a, b) => a.price - b.price);
    if (sort === "high") out = [...out].sort((a, b) => b.price - a.price);
    if (sort === "new") out = [...out].sort((a, b) => Number(b.inStock) - Number(a.inStock) || b.createdAt - a.createdAt);
    return out;
  }, [products, cat, cond, q, sort]);

  if (error) return <div className="page-loading">{error}</div>;
  if (!data) return <div className="page-loading"><img src="/logo.svg" alt="" width="120" height="75" /><p>Loading...</p></div>;

  const overall = avg(reviews);

  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <a href="#top" className="brand"><img src="/logo.svg" alt="" width="54" height="34" /><span>{settings.shopName}<small>{settings.tagline}</small></span></a>
          <nav>
            <a href="#shop">Shop</a>
            <a href="#grades">Condition Guide</a>
            <a href="#reviews">Reviews</a>
            <a href="#contact">Contact</a>
          </nav>
          {settings.phone && <a className="btn primary sm" href={`tel:${settings.phone}`}><IconPhone width={16} height={16} /> <span className="hide-sm">{settings.phone}</span><span className="show-sm">Call</span></a>}
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero-in">
            <div>
              <span className="eyebrow">Srinagar's trusted laptop &amp; computer store</span>
              <h1>{settings.heroTitle}</h1>
              <p>{settings.heroText}</p>
              <div className="hero-cta">
                <a className="btn gold" href="#shop">Browse devices</a>
                <a className="btn outline" href={waLink(settings, `Hello ${settings.shopName}, I need help choosing a laptop.`)} target="_blank" rel="noopener noreferrer"><IconWhatsApp /> Chat on WhatsApp</a>
              </div>
              {reviews.length > 0 && (
                <div className="hero-rate"><Stars value={overall} size={18} /> <b>{overall.toFixed(1)}</b> from {reviews.length} customer review{reviews.length > 1 ? "s" : ""}</div>
              )}
            </div>
            <div className="hero-art" aria-hidden="true">
              <img src="/logo.svg" alt="" width="320" height="200" />
            </div>
          </div>
        </section>

        <section className="trust">
          <div className="wrap trust-in">
            <div><IconTools /><b>Tested &amp; quality-checked</b><span>Every device inspected before sale</span></div>
            <div><IconTag /><b>Honest grading</b><span>True condition shown on every listing</span></div>
            <div><IconShield /><b>Warranty included</b><span>Clear warranty on each device</span></div>
            <div><IconCheck /><b>New &amp; refurbished</b><span>Choose what fits your budget</span></div>
          </div>
        </section>

        <section id="shop" className="section">
          <div className="wrap">
            <h2 className="h2">Our Laptops &amp; Computers</h2>
            <p className="sub">{settings.warrantyNote}</p>

            <div className="filters">
              <div className="search"><IconSearch width={18} height={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brand, processor, RAM..." aria-label="Search" /></div>
              <div className="pills" role="group" aria-label="Category">
                {["All", ...CATEGORIES].map((c) => (<button key={c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{c === "All" ? "All" : c + "s"}</button>))}
              </div>
              <div className="pills" role="group" aria-label="Condition">
                {[["All", "Any condition"], ["new", "Brand new"], ["refurb", "Refurbished"]].map(([k, l]) => (<button key={k} className={cond === k ? "on" : ""} onClick={() => setCond(k)}>{l}</button>))}
              </div>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
                <option value="new">Newest first</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </div>

            {list.length === 0 ? (
              <div className="empty">No devices match your search. Try another filter or <a href={waLink(settings, "Hello, I'm looking for a laptop.")} target="_blank" rel="noopener noreferrer">ask us on WhatsApp</a>.</div>
            ) : (
              <div className="grid">
                {list.map((p) => (<ProductCard key={p.id} p={p} rating={avg(byProduct[p.id] || [])} count={(byProduct[p.id] || []).length} onOpen={setOpen} />))}
              </div>
            )}
          </div>
        </section>

        <section id="grades" className="section alt">
          <div className="wrap">
            <h2 className="h2">Understand our condition grades</h2>
            <p className="sub">No surprises. Every listing shows exactly what you are buying.</p>
            <div className="grades">
              {Object.entries(CONDITIONS).map(([k, c]) => (
                <div key={k} className={"grade cond-" + c.tone}><h4>{c.label}</h4><p>{c.desc}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section id="reviews" className="section">
          <div className="wrap">
            <h2 className="h2">What our customers say</h2>
            <div className="rev-layout">
              <div className="rev-list">
                {reviews.length === 0 && <div className="empty">No reviews yet. Be the first to share your experience!</div>}
                {reviews.slice(0, 12).map((r) => {
                  const prod = products.find((p) => p.id === r.productId);
                  return (
                    <div className="rev" key={r.id}>
                      <div className="rev-h"><b>{r.name}</b><Stars value={r.rating} size={15} /></div>
                      <p>{r.comment}</p>
                      <small>{prod ? prod.name + " · " : ""}{dateFmt(r.createdAt)}</small>
                    </div>
                  );
                })}
              </div>
              <ReviewForm products={products} />
            </div>
          </div>
        </section>

        <section id="contact" className="section alt">
          <div className="wrap contact">
            <div>
              <h2 className="h2">Visit our store</h2>
              <ul className="info">
                <li><IconPin /><span>{settings.address}</span></li>
                {settings.phone && <li><IconPhone /><a href={`tel:${settings.phone}`}>{settings.phone}</a></li>}
                {settings.email && <li><IconMail /><a href={`mailto:${settings.email}`}>{settings.email}</a></li>}
                {settings.hours && <li><IconClock /><span>{settings.hours}</span></li>}
              </ul>
              <div className="hero-cta">
                {settings.mapUrl && <a className="btn primary" href={settings.mapUrl} target="_blank" rel="noopener noreferrer"><IconPin /> Open in Google Maps</a>}
                <a className="btn wa" href={waLink(settings, `Hello ${settings.shopName}`)} target="_blank" rel="noopener noreferrer"><IconWhatsApp /> WhatsApp us</a>
              </div>
            </div>
            <div className="why">
              <h3>Why customers choose us</h3>
              <ul>
                <li><IconCheck /> New and refurbished devices under one roof</li>
                <li><IconCheck /> Condition and price clearly shown, no hidden surprises</li>
                <li><IconCheck /> Tested hardware with warranty</li>
                <li><IconCheck /> Friendly advice to match the right device to your budget</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap foot-in">
          <div className="brand light"><img src="/logo.svg" alt="" width="54" height="34" /><span>{settings.shopName}<small>{settings.tagline}</small></span></div>
          {settings.socials.length > 0 && (
            <div className="socials">
              {settings.socials.map((s) => (
                <a key={s.platform + s.url} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={socialLabel(s.platform)} title={socialLabel(s.platform)}><SocialIcon platform={s.platform} /></a>
              ))}
            </div>
          )}
          <small>&copy; {new Date().getFullYear()} {settings.shopName}. All rights reserved.</small>
        </div>
      </footer>

      <a className="float-wa" href={waLink(settings, `Hello ${settings.shopName}`)} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"><IconWhatsApp width={28} height={28} /></a>

      {open && <ProductModal p={open} settings={settings} reviews={byProduct[open.id] || []} onClose={() => setOpen(null)} />}
    </>
  );
}
