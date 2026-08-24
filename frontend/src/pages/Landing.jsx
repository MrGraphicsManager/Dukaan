import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Receipt, Package, Users, Wallet, BarChart3, Store, ArrowRight, ShieldCheck, Check
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { t } from "@/lib/i18n";
import InstallAppButton from "@/components/InstallAppButton";

const FEATURES = [
  { icon: Receipt, title: "Billing", body: "Fast POS. Cash, UPI, Udhaar. One tap to bill." },
  { icon: Package, title: "Inventory", body: "Track stock, minimum levels, low-stock alerts." },
  { icon: Wallet, title: "Udhaar", body: "Track pending payments. Send WhatsApp reminders." },
  { icon: Users, title: "Customers", body: "Full purchase history for every customer." },
  { icon: BarChart3, title: "Reports", body: "Daily, weekly, monthly sales at a glance." },
  { icon: Store, title: "Multi-shop", body: "Manage many shops from one login." },
];

const PLANS = [
  { name: "Starter", setup: 299, price: 99, perks: ["Billing","Products & stock","Order history"] },
  { name: "Business", setup: 499, price: 149, perks: ["Everything in Starter","Customers","Udhaar tracking","Reports & reminders"], featured: true },
  { name: "Premium", setup: 999, price: 299, perks: ["Everything in Business","Advanced reports","Customization","Priority support"] },
];

const FAQS = [
  { q: "Do I need a computer?", a: "No. Dukaan works on any smartphone or tablet. Also on desktop." },
  { q: "Will the app process my UPI payments?", a: "No. Dukaan shows your own saved UPI QR to the customer. You confirm the payment received. This keeps things safe and simple." },
  { q: "Can I use it offline?", a: "You need internet to sync. The bills you make while online are always saved securely." },
  { q: "Which languages are supported?", a: "English, हिन्दी and ગુજરાતી. Switch anytime from the app." },
];

export default function Landing() {
  const nav = useNavigate();
  const { user, lang } = useAuth();

  return (
    <div className="min-h-screen bg-brand-sand text-brand-indigo noise">
      {/* Top */}
      <header className="sticky top-0 z-30 bg-brand-sand/90 backdrop-blur border-b border-brand-mitti">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl md:text-3xl" data-testid="landing-logo">
            दुकान · Dukaan
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => nav("/app")} data-testid="cta-open-app" className="bg-brand-indigo text-white hover:bg-brand-indigo/90">
                Open app <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            ) : (
              <>
                <Link to="/login" data-testid="nav-login" className="text-sm font-medium hover:text-brand-terracotta transition-colors">Log in</Link>
                <Button onClick={() => nav("/register")} data-testid="cta-signup-top" className="bg-brand-terracotta text-white hover:bg-brand-terracotta/90 active:scale-95 transition-transform">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-14 md:pt-24 pb-16 grid lg:grid-cols-12 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="lg:col-span-7"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-mitti bg-white/60 text-xs font-semibold uppercase tracking-widest text-brand-terracotta">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta" /> Made for Indian shops
          </div>
          <h1 className="mt-5 font-display text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
            Your Shop.<br />
            Your Sales.<br />
            <span className="text-brand-terracotta">Your Stock.</span><br />
            All in one place.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-indigo/75 max-w-xl leading-relaxed">
            Simple billing, stock and udhaar tracking — built for kirana stores, cafés and neighbourhood shops.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => nav("/register")}
              className="h-12 px-6 bg-brand-terracotta text-white hover:bg-brand-terracotta/90 active:scale-95 transition-transform"
              data-testid="hero-start-free"
            >
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <InstallAppButton variant="outline" />
          </div>
          <div className="mt-6 flex items-center gap-3 text-sm text-brand-indigo/60">
            <ShieldCheck className="w-4 h-4" /> Plans from ₹99/month · Pay directly via UPI
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-lift">
            <img
              src="https://images.pexels.com/photos/35317008/pexels-photo-35317008.jpeg"
              alt="Indian shopkeeper"
              className="w-full h-[440px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-indigo/80 via-brand-indigo/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 rounded-xl p-4 border border-brand-mitti">
              <div className="text-xs uppercase tracking-widest text-brand-terracotta font-semibold">Today's sales</div>
              <div className="mt-1 font-heading text-3xl font-bold">₹12,480</div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded bg-brand-mitti/50 px-2 py-1"><b>Cash</b> ₹6,200</div>
                <div className="rounded bg-brand-mitti/50 px-2 py-1"><b>UPI</b> ₹5,280</div>
                <div className="rounded bg-brand-mitti/50 px-2 py-1"><b>Udhaar</b> ₹1,000</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-16 border-t border-brand-mitti">
        <h2 className="font-display text-4xl md:text-5xl">How it works</h2>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {[
            { n: "01", t: "Add your products", b: "One-time setup. Add products, prices and stock." },
            { n: "02", t: "Bill your customers", b: "Cash, UPI QR or udhaar — one screen, few taps." },
            { n: "03", t: "Track everything", b: "Stock, udhaar, reports — always up to date." },
          ].map((s) => (
            <div key={s.n} className="bg-white rounded-xl border border-brand-mitti p-6 shadow-card hover:shadow-lift transition-shadow">
              <div className="font-display text-5xl text-brand-terracotta">{s.n}</div>
              <div className="mt-2 font-heading text-xl font-bold">{s.t}</div>
              <p className="mt-1 text-brand-indigo/70">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-16 border-t border-brand-mitti">
        <h2 className="font-display text-4xl md:text-5xl">Everything a small shop needs</h2>
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white rounded-xl border border-brand-mitti p-6 shadow-card">
              <div className="w-11 h-11 rounded-lg bg-brand-indigo text-white grid place-items-center">
                <Icon className="w-5 h-5" />
              </div>
              <div className="mt-4 font-heading text-lg font-bold">{title}</div>
              <p className="mt-1 text-brand-indigo/70">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-16 border-t border-brand-mitti">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <h2 className="font-display text-4xl md:text-5xl">Simple pricing</h2>
          <p className="text-brand-indigo/70 max-w-md">Start free. Upgrade only when you need more.</p>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {PLANS.map((p) => (
            <div key={p.name} className={`rounded-xl p-6 border shadow-card ${p.featured ? "bg-brand-indigo text-white border-brand-indigo" : "bg-white border-brand-mitti"}`}>
              <div className={`text-xs uppercase tracking-widest font-semibold ${p.featured ? "text-brand-terracotta" : "text-brand-terracotta"}`}>{p.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-5xl">₹{p.price}</span>
                <span className={`text-sm ${p.featured ? "text-white/70" : "text-brand-indigo/60"}`}>/month</span>
              </div>
              <div className={`text-sm ${p.featured ? "text-white/70" : "text-brand-indigo/60"}`}>+ ₹{p.setup} one-time setup</div>
              <ul className="mt-5 space-y-2 text-sm">
                {p.perks.map(x => (
                  <li key={x} className="flex items-start gap-2">
                    <Check className={`w-4 h-4 mt-0.5 ${p.featured ? "text-brand-terracotta" : "text-brand-leaf"}`} /> {x}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => nav(`/subscribe?plan=${p.name.toLowerCase()}`)}
                data-testid={`price-cta-${p.name.toLowerCase()}`}
                className={`mt-6 w-full active:scale-95 transition-transform ${p.featured ? "bg-brand-terracotta hover:bg-brand-terracotta/90 text-white" : "bg-brand-indigo hover:bg-brand-indigo/90 text-white"}`}
              >
                Choose {p.name}
              </Button>
              <button
                onClick={() => nav(`/subscribe?plan=${p.name.toLowerCase()}`)}
                data-testid={`price-subscribe-${p.name.toLowerCase()}`}
                className={`mt-2 w-full text-sm font-semibold hover:underline ${p.featured ? "text-white/80" : "text-brand-terracotta"}`}
              >
                Pay via UPI now →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ + Contact */}
      <section className="mx-auto max-w-6xl px-5 py-16 border-t border-brand-mitti grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="font-display text-4xl">FAQ</h2>
          <Accordion type="single" collapsible className="mt-6">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger data-testid={`faq-${i}`} className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-brand-indigo/75">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div>
          <h2 className="font-display text-4xl">Contact</h2>
          <p className="mt-4 text-brand-indigo/75">Have a question? Write to us and we'll respond within a day.</p>
          <div className="mt-4 rounded-xl border border-brand-mitti bg-white p-6">
            <div className="text-sm text-brand-indigo/60 uppercase tracking-widest">Email</div>
            <div className="mt-1 font-heading text-lg font-semibold">contact@officialdukaan.in</div>
            <div className="mt-4 text-sm text-brand-indigo/60 uppercase tracking-widest">Phone</div>
            <div className="mt-1 font-heading text-lg font-semibold">+91 7016430577</div>
          </div>
        </div>
      </section>

      <footer className="border-t border-brand-mitti py-8 text-center text-sm text-brand-indigo/60">
  <div className="flex items-center justify-center gap-6 mt-2">
  <a
    href="/info"
    className="text-brand-terracotta hover:underline"
  >
    Info
  </a>

  <a
    href="/privacy-policy"
    className="text-brand-terracotta hover:underline"
  >
    Privacy Policy
  </a>

  <a
    href="/refund-policy"
    className="text-brand-terracotta hover:underline"
  >
    Refund Policy
  </a>
</div>
</footer>
    </div>
  );
}
