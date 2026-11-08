export const CONDITIONS = {
  new: { label: "Brand New", short: "New", tone: "new", desc: "Sealed and unused, with full manufacturer warranty." },
  A: { label: "Refurbished - Grade A", short: "Grade A", tone: "a", desc: "Like new. Little to no visible marks. Fully tested and cleaned." },
  B: { label: "Refurbished - Grade B", short: "Grade B", tone: "b", desc: "Good condition. Light scratches or marks on the body; works perfectly." },
  C: { label: "Refurbished - Grade C", short: "Grade C", tone: "c", desc: "Fair. Visible wear and cosmetic marks, fully functional at the lowest price." },
};

export const CATEGORIES = ["Laptop", "Desktop", "Accessory"];

export const money = (n) => (n ? "₹" + Number(n).toLocaleString("en-IN") : "Ask for price");

export const discount = (p) => (p.originalPrice > p.price && p.price > 0 ? Math.round((1 - p.price / p.originalPrice) * 100) : 0);

export const waLink = (settings, text) => {
  const n = (settings.whatsapp || settings.phone || "").replace(/\D/g, "");
  const num = n.length === 10 ? "91" + n : n;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
};

export const avg = (list) => (list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0);

export const dateFmt = (t) => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
