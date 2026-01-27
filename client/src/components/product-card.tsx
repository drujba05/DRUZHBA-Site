import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { ShoppingCart, Eye } from "lucide-react";

export function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart();

  return (
    <Card className="group border-none shadow-none bg-transparent overflow-visible">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-slate-100 mb-4 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-slate-200 group-hover:-translate-y-2">
        {/* ЯРКИЕ БЕЙДЖИ БЕЗ ПРОЗРАЧНОСТИ */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.is_new && (
            <div className="bg-green-600 text-white text-[10px] font-[900] px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-xl">
              Новинка
            </div>
          )}
          {product.is_bestseller && (
            <div className="bg-orange-600 text-white text-[10px] font-[900] px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-xl">
              Хит продаж
            </div>
          )}
        </div>

        <img
          src={product.main_photo}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Button size="icon" variant="secondary" className="rounded-full h-12 w-12 bg-white text-slate-900 hover:bg-blue-600 hover:text-white border-none shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <Eye size={20} />
          </Button>
          <Button 
            size="icon" 
            onClick={() => addItem(product)}
            className="rounded-full h-12 w-12 bg-blue-600 text-white hover:bg-blue-700 border-none shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
          >
            <ShoppingCart size={20} />
          </Button>
        </div>
      </div>

      <CardContent className="p-0 space-y-1 text-center">
        <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-tight truncate px-2">
          {product.name}
        </h3>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
            {product.category}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-600 tracking-tighter">
              {product.price}
            </span>
            <span className="text-xs font-black text-blue-600 uppercase">сом</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
