import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Фоновое свечение */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />

      <div className="max-w-4xl w-full text-center z-10 space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl mb-4">
            <Zap className="text-yellow-400 h-4 w-4" />
            <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Прямые поставки с Дордоя</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85]">
            DRUZHBA<span className="text-blue-600">.</span>
          </h1>
          
          {/* ИСПРАВЛЕННАЯ СТРОКА - ТЕПЕРЬ ЯРКО-ГОЛУБАЯ */}
          <p className="text-xl md:text-2xl font-black text-sky-400 uppercase tracking-tight">
            Мы занимаемся собственным производством
          </p>
          
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Оптовая продажа качественной обуви напрямую от производителя. 
            Лучшие цены на рынке и гарантия качества.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 w-full md:w-auto">
            <Link href="/catalog" className="flex items-center gap-2">
              Открыть каталог <ArrowRight size={18} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-sm backdrop-blur-sm w-full md:w-auto">
            <Link href="/about">О нас</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-12 border-t border-white/5">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-blue-600/20 p-3 rounded-2xl"><Star className="text-blue-400" /></div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Premium Качество</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-purple-600/20 p-3 rounded-2xl"><ShieldCheck className="text-purple-400" /></div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Гарантия Производства</span>
          </div>
          <div className="flex flex-col items-center gap-2 col-span-2 md:col-span-1">
            <div className="bg-emerald-600/20 p-3 rounded-2xl"><Zap className="text-emerald-400" /></div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Быстрая Отгрузка</span>
          </div>
        </div>
      </div>
    </div>
  );
}
