import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-md mx-auto space-y-6 pt-20 text-center">
        <div className="flex justify-center">
          <div className="bg-white p-6 rounded-full shadow-sm">
            <ShoppingBag size={48} className="text-slate-300" />
          </div>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tighter">Корзина пуста</h1>
        <p className="text-slate-500">Вы еще не выбрали товары для заказа</p>
        <Link href="/">
          <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold uppercase gap-2 shadow-lg transition-all">
            <ArrowLeft size={18} /> Вернуться в каталог
          </Button>
        </Link>
      </div>
    </div>
  );
}
