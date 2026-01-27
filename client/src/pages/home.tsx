import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl mb-4">
            <Zap className="text-blue-600 h-4 w-4" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Прямые поставки с Дордоя</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 uppercase tracking-tighter leading-[0.85]">
            DRUZHBA<span className="text-blue-600">.</span>
          </h1>
          
          {/* ВОТ ЭТА СТРОКА: ТЕПЕРЬ ЯРКО-ГОЛУБАЯ И ЖИРНАЯ */}
          <p className="text-xl md:text-2xl font-black text-sky-500 uppercase tracking-tight">
            Мы занимаемся собственным производством
          </p>
          
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Оптовая продажа качественной обуви напрямую от производителя. 
            Лучшие цены на рынке и гарантия качества.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-100 transition-all hover:scale-105 active:scale-95 w-full md:w-auto border-none">
            <Link href="/catalog" className="flex items-center gap-2">
              Открыть каталог <ArrowRight size={18} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-black uppercase tracking-widest text-sm w-full md:w-auto">
            <Link href="/about">О нас</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-12 border-t border-slate-100">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-blue-50 p-3 rounded-2xl"><Star className="text-blue-600" /></div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Premium Качество</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-blue-50 p-3 rounded-2xl"><ShieldCheck className="text-blue-600" /></div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Гарантия</span>
          </div>
          <div className="flex flex-col items-center gap-2 col-span-2 md:col-span-1">
            <div className="bg-blue-50 p-3 rounded-2xl"><Zap className="text-blue-600" /></div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Быстрая Отгрузка</span>
          </div>
        </div>
      </div>
    </div>
  );
}
