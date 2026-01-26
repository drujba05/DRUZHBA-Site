"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPanel } from "@/components/admin-panel";
import { useProducts } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";

const ADMIN_PASSWORD = "Medina050891"; 
const STORAGE_KEY = "admin_auth";

export default function AdminPage() {
  const { toast } = useToast();
  const { products, addProduct, updateProduct, deleteProduct, isLoading, error } = useProducts();

  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem(STORAGE_KEY);
    if (auth === "true") setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      setIsAuthenticated(true);
      toast({ title: "Вход выполнен" });
    } else {
      toast({ title: "Ошибка", description: "Неверный пароль", variant: "destructive" });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <Card className="w-full max-w-sm bg-slate-800 border-slate-700">
          <CardHeader><CardTitle className="text-center text-white">Вход в DRUZHBA</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleLogin}>Войти</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Шапка адаптированная под мобильный */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
        <h1 className="text-sm font-bold uppercase tracking-widest">Админка</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw size={14} />
          </Button>
          <Button variant="destructive" size="sm" onClick={() => { localStorage.removeItem(STORAGE_KEY); setIsAuthenticated(false); }}>
            Выйти
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* БЛОК ДИАГНОСТИКИ (Чтобы видеть ошибки без ПК) */}
        <div className="mb-6 p-4 rounded-xl bg-white border shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2">
            Статус базы: 
            {isLoading ? <Loader2 className="animate-spin text-blue-500" size={18} /> : <span className="text-green-600">ОК</span>}
          </h2>
          
          {error && (
            <div className="mt-2 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100 flex items-center gap-2">
              <AlertTriangle size={14} /> Ошибка связи с сервером!
            </div>
          )}

          <p className="text-sm text-slate-500 mt-1">
            Найдено товаров: <span className="font-bold text-slate-900">{products?.length ?? 0}</span>
          </p>
          
          {products?.length === 0 && !isLoading && (
            <div className="mt-3 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100">
              ℹ️ В базе пусто. Попробуйте добавить первый товар через форму ниже.
            </div>
          )}
        </div>

        {/* ОСНОВНАЯ ПАНЕЛЬ */}
        <AdminPanel 
          products={products || []}
          onAddProduct={addProduct}
          onUpdateProduct={updateProduct}
          onDeleteProduct={deleteProduct}
        />
      </div>
    </div>
  );
        }
