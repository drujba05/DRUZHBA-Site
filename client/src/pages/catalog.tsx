import { useState } from "react";
import { Link } from "wouter";
import { useProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { CartDrawer } from "@/components/cart-drawer";
import { ArrowLeft, MapPin, Phone, Clock, MessageCircle, Star, ShieldCheck, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Catalog() {
  const { products } = useProducts();
  
  const [selectedSeason, setSelectedSeason] = useState("Все");
  const [selectedGender, setSelectedGender] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");

  const seasons = ["Все", "Зима", "Лето", "Демисезон"];
  const genders = ["Все", "Мужские", "Женские", "Детские"];

  const filteredProducts = products.filter((product) => {
    const matchesSeason = selectedSeason === "Все" || product.season === selectedSeason;
    const matchesGender = selectedGender === "Все" || product.gender === selectedGender;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.sku || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSeason && matchesGender && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <nav className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: "rgba(88, 28, 135, 0.95)", backdropFilter: "blur(10px)" }}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl flex items-center text-sm transition-all border border-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" /> На главную
          </Link>
          <CartDrawer />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="space-y-6 mb-10">
          <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Каталог</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="lg:col-span-4 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Поиск по названию..." 
                className="pl-12 h-12 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="lg:col-span-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-black uppercase text-slate-400 mr-2">Сезон:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {seasons.map((season) => (
                  <button
                    key={season}
                    onClick={() => setSelectedSeason(season)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                      selectedSeason === season ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {season}
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-black uppercase text-slate-400 mr-2">Для кого:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {genders.map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setSelectedGender(gender)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                      selectedGender === gender ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
            <Filter className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 uppercase">Ничего не нашли</h3>
            <Button 
              variant="outline" 
              onClick={() => { setSelectedSeason("Все"); setSelectedGender("Все"); setSearchQuery(""); }}
              className="mt-6 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              Сбросить все фильтры
            </Button>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-300 py-16 mt-12 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">DRUZHBA</h2>
              <p className="text-slate-400 leading-relaxed text-sm">Ваш надежный партнер на рынке «Дордой». Высокое качество и лучшие цены напрямую от производителя.</p>
              <div className="flex gap-3">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center gap-2">
                  <Star className="text-yellow-500 h-4 w-4" />
                  <span className="text-[10px] font-black uppercase text-white tracking-widest">Premium</span>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center gap-2">
                  <ShieldCheck className="text-blue-500 h-4 w-4" />
                  <span className="text-[10px] font-black uppercase text-white tracking-widest">Quality</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em] opacity-50">Контакты</h3>
              <div className="space-y-5">
                {/* Исправленный Телефон */}
                <div className="flex items-center gap-4 group">
                  <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-900/40 transition-transform group-hover:scale-110">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <a href="tel:+996557650131" className="text-lg font-black text-white bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:bg-blue-600/20 hover:border-blue-500/50 transition-all">
                    +996 557 650 131
                  </a>
                </div>
                {/* Исправленный Telegram */}
                <div className="flex items-center gap-4 group">
                  <div className="bg-sky-500 p-3 rounded-2xl shadow-lg shadow-sky-900/40 transition-transform group-hover:scale-110">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <a href="https://t.me/DRUZHBAA_Bot" target="_blank" className="text-lg font-black text-white bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:bg-sky-500/20 hover:border-sky-400/50 transition-all">
                    Telegram Bot
                  </a>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-slate-800 p-3 rounded-2xl">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium pt-1 text-slate-200">Рынок "Дордой", Оберон Форт,<br />30 проход, 2 контейнер</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em] opacity-50">Режим работы</h3>
              <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
                <div className="flex items-center gap-4 mb-4">
                  <Clock className="h-6 w-6 text-blue-400" />
                  <span className="text-2xl font-black text-white tracking-tighter">08:00 – 17:00</span>
                </div>
                <ul className="text-xs space-y-3 text-slate-400 font-bold uppercase tracking-wider">
                  <li className="flex justify-between"><span>Пн – Чт</span> <span className="text-green-400">Открыто</span></li>
                  <li className="flex justify-between border-b border-white/5 pb-2"><span>Пятница</span> <span className="text-red-500 font-black">Выходной</span></li>
                  <li className="flex justify-between"><span>Сб – Вс</span> <span className="text-green-400">Открыто</span></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.5em] text-white">
              © 2026 DRUZHBA • MADE WITH PASSION
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
