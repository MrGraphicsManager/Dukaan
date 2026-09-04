import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Store, 
  Search, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Phone, 
  ExternalLink, 
  ShoppingBag,
  ArrowRight,
  Filter,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function PublicStoreDirectory() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Stores" },
    { id: "Grocery & Kirana", label: "Grocery & Kirana" },
    { id: "Medical Store & Pharmacy", label: "Medical & Pharmacy" },
    { id: "General Store", label: "General Store" },
    { id: "Supermarket", label: "Supermarket" }
  ];

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const res = await api.get("/stores");
        if (Array.isArray(res.data)) {
          setStores(res.data);
        } else {
          fallbackStores();
        }
      } catch (e) {
        fallbackStores();
      } finally {
        setLoading(false);
      }
    };

    const fallbackStores = () => {
      setStores([
        {
          id: "store_1",
          name: "Yug Super Mart & FMCG",
          owner: "Priyen Yug",
          category: "Grocery & Kirana",
          city: "Navsari",
          state: "Gujarat",
          phone: "919876543210",
          verified: true,
          rating: 4.9,
          items_count: 420,
          catalog_preview: ["Amul Butter", "Tata Salt", "Maggi 70g", "Fortune Oil"]
        },
        {
          id: "store_2",
          name: "Sharma Daily Needs & Dairy",
          owner: "Rajesh Sharma",
          category: "General Store",
          city: "Mumbai",
          state: "Maharashtra",
          phone: "919123456780",
          verified: true,
          rating: 4.8,
          items_count: 310,
          catalog_preview: ["Parle-G", "Britannia Good Day", "Dettol Soap"]
        },
        {
          id: "store_3",
          name: "Sanjivani Medicos & Pharmacy",
          owner: "Dr. Sandeep Mehta",
          category: "Medical Store & Pharmacy",
          city: "Jaipur",
          state: "Rajasthan",
          phone: "919822334455",
          verified: true,
          rating: 5.0,
          items_count: 560,
          catalog_preview: ["Paracetamol 650mg", "Azithromycin 500mg", "Dabur Chyawanprash"]
        },
        {
          id: "store_4",
          name: "Balaji Provisions & Wholesale",
          owner: "Venkatesh Rao",
          category: "Supermarket",
          city: "Bengaluru",
          state: "Karnataka",
          phone: "919744112233",
          verified: true,
          rating: 4.7,
          items_count: 890,
          catalog_preview: ["Aashirvaad Atta 10kg", "Red Label Tea 500g", "Surf Excel 1kg"]
        }
      ]);
    };

    fetchStores();
  }, []);

  const filteredStores = stores.filter(st => {
    const matchesSearch = 
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.owner.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || st.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-slate-900 flex flex-col selection:bg-brand-orange/20">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E8E5DF] px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#1B1464] flex items-center justify-center text-white font-black text-xl shadow-md">
            D
          </div>
          <div>
            <div className="font-extrabold text-[#1B1464] text-lg tracking-tight leading-tight">Dukaan Directory</div>
            <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Verified India Storefronts</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="font-bold text-slate-700 text-xs">
              Merchant Login
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="bg-[#D4623B] hover:bg-[#c05530] text-white font-bold text-xs rounded-xl shadow-sm">
              List Your Dukaan Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Search Section */}
      <section className="relative py-12 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-[#D4623B] border border-orange-200 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" /> Over 10,000+ Dukaans Powered Across 28 States
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1B1464] tracking-tight">
          Explore Verified Local <span className="text-[#D4623B]">Dukaans</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Order directly on WhatsApp from trusted local kiranas, supermarkets, pharmacies, and specialty stores near you with zero marketplace commissions.
        </p>

        {/* Search Input Bar */}
        <div className="max-w-2xl mx-auto mt-6">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by store name, city (e.g. Navsari, Mumbai), or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 pr-4 bg-white rounded-2xl border-[#E8E5DF] shadow-md text-slate-800 placeholder:text-slate-400 text-sm font-medium focus-visible:ring-2 focus-visible:ring-[#D4623B]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pt-4 pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#1B1464] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-[#E8E5DF]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Stores Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Showing {filteredStores.length} Verified {filteredStores.length === 1 ? "Store" : "Stores"}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500 font-medium">
            Loading verified dukaans across India...
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#E8E5DF] p-8 max-w-md mx-auto space-y-3">
            <Store className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="font-bold text-slate-800 text-base">No Dukaans Found</div>
            <p className="text-xs text-slate-500">
              We couldn't find any stores matching "{searchQuery}". Try searching for a different city or category.
            </p>
            <Button
              onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
              variant="outline"
              size="sm"
              className="mt-2 text-xs font-bold"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map(st => (
              <div 
                key={st.id} 
                className="bg-white rounded-3xl border border-[#E8E5DF] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Top Meta */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-extrabold text-[#1B1464] text-lg group-hover:text-[#D4623B] transition-colors">
                          {st.name}
                        </h3>
                        {st.verified && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full" title="Verified Dukaan Merchant">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        Proprietor: <span className="font-semibold text-slate-700">{st.owner}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded-xl shrink-0">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{st.rating}</span>
                    </div>
                  </div>

                  {/* Location & Category */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{st.city}, {st.state}</span>
                    </div>
                    <div className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg text-[11px]">
                      {st.category} · {st.items_count}+ Products
                    </div>
                  </div>

                  {/* Catalog Preview Pills */}
                  {st.catalog_preview && st.catalog_preview.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Available Products</div>
                      <div className="flex flex-wrap gap-1.5">
                        {st.catalog_preview.map((p, idx) => (
                          <span key={idx} className="text-[11px] bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={`https://wa.me/${st.phone}?text=Namaste%20${encodeURIComponent(st.name)},%20I%20saw%20your%20storefront%20on%20OfficialDukaan.in%20and%20want%20to%20place%20an%20order.`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                  >
                    <Button 
                      size="sm" 
                      className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Order on WhatsApp
                    </Button>
                  </a>

                  <Link to="/register">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs font-bold rounded-xl border-[#E8E5DF] hover:bg-slate-50"
                      title="Open storefront"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8E5DF] py-6 px-4 text-center text-xs text-slate-500">
        <p>© 2026 OfficialDukaan.in · Empowering Bharat's Local Retail Merchants · Made with ❤️ in India</p>
      </footer>
    </div>
  );
}
