import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useProducts } from "@/lib/products";
import { AdminPanel } from "@/components/admin-panel";
import { ArrowLeft, Lock, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  // Добавлена переменная isLoading для отслеживания загрузки
  const { products, addProduct, updateProduct, deleteProduct, isLoading: isDataLoading } = useProducts();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_auth");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // ВАЖНО: Заменил fetch на простую проверку, чтобы ты мог зайти
    // Позже ты сможешь вернуть fetch, если настроишь сервер
    if (password === "Medina050891") {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      toast({ title: "Добро пожаловать!", description: "Вы вошли в панель управления." });
      setIsLoading(false);
    } else {
      setTimeout(() => {
        toast({ title: "Ошибка", description: "Неверный пароль", variant: "destructive" });
        setIsLoading(false);
        setPassword("");
      }, 500);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_auth");
    toast({ title: "Выход выполнен" });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">DRUZHBA Admin</CardTitle>
            <CardDescription>Введите пароль для доступа к панели управления</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center text-lg"
                autoFocus
              />
              <Button type="submit" className="w-full" disabled={isLoading || !password}>
                {isLoading ? "Проверка..." : "Войти"}
              </Button>
              <div className="text-center">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                  ← Вернуться на сайт
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans pt-20">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-heading font-bold text-xl text-white tracking-tighter">DRUZHBA ADMIN</Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> На сайт
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-300 hover:text-white">
              <LogOut className="h-4 w-4 mr-2" /> Выйти
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-heading font-bold text-gray-800 mb-2">
              Управление товарами
            </h2>
            <p className="text-muted-foreground">
              Всего товаров в списке: {products?.length || 0}
            </p>
          </div>
          
          {/* Добавлена проверка на загрузку, чтобы не показывать пустую панель */}
          {isDataLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
          ) : (
            <AdminPanel 
              products={products || []}
              onAddProduct={addProduct}
              onUpdateProduct={onUpdateProductWrapper}
              onDeleteProduct={onDeleteProductWrapper}
            />
          )}
        </div>
      </main>
    </div>
  );

  // Обертки для функций, чтобы избежать ошибок типизации ID
  async function onUpdateProductWrapper(id: string, data: Partial<Product>) {
    return updateProduct({ ...data, id: Number(id) } as any);
  }
  
  async function onDeleteProductWrapper(id: string) {
    return deleteProduct(Number(id));
  }
      }
