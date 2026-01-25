import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useProducts } from "@/lib/products";
import { AdminPanel } from "@/components/admin-panel";
import { ArrowLeft, Lock, LogOut, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_auth");
    if (saved === "true") setIsAuthenticated(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem("admin_auth", "true");
        toast({ title: "Успешный вход!" });
      } else {
        toast({ title: "Ошибка", description: "Неверный пароль", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка подключения", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_auth");
    toast({ title: "Вы вышли из системы" });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <Card className="w-full max-w-md shadow-2xl border-none">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">DRUZHBA ADMIN</CardTitle>
            <CardDescription>Введите паро "12345" или ваш пароль</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Пароль доступа"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-center text-lg bg-slate-50 border-slate-200"
                  autoFocus
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold" disabled={isLoading || !password}>
                {isLoading ? "Вход..." : "ВОЙТИ В ПАНЕЛЬ"}
              </Button>
              <div className="text-center">
                <Link href="/" className="text-sm text-slate-400 hover:text-blue-600 font-medium transition-colors">
                  ← Назад в магазин
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] pt-20">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-black text-xl tracking-tighter text-blue-600">DRUZHBA ADMIN</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-bold text-slate-600 flex items-center hover:text-blue-600">
              <ArrowLeft className="mr-2 h-4 w-4" /> В МАГАЗИН
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="text-rose-500 font-bold hover:bg-rose-50">
              <LogOut className="h-4 w-4 mr-2" /> ВЫЙТИ
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <AdminPanel 
            products={products}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
          />
        </div>
      </main>
    </div>
  );
                }
