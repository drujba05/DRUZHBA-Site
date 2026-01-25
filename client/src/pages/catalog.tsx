import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { CartDrawer } from "@/components/cart-drawer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Snowflake, Sun, SlidersHorizontal, Users, Sparkles, Flame, Check } from "lucide-react";

type SortOption = "default" | "new_first" | "popular_first";
type GenderFilter = "Все" | "Женские" | "Мужские" | "Детские";

export default function Catalog() {
  const { products } = useProducts();
  const [seasonFilter, setSeasonFilter] = useState<"Зима" | "Лето" | null>(null);
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("Все");
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("default");

  const filteredProducts = products
    .filter(p => {
      if (seasonFilter && (p.season || "Все сезоны") !== seasonFilter && (p.season || "Все сезоны") !== "Все сезоны") {
        return false;
      }
      if (genderFilter !== "Все" && (p.gender || "Универсальные") !== genderFilter && (p.gender || "Универсальные") !== "Универсальные") {
        return false;
      }
      if (showNewOnly && !p.is_new) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOption === "new_first") {
        if (a.is_new && !b.is_new) return -1;
        if (!a.is_new && b.is_new) return 1;
        return 0;
      }
      if (sortOption === "popular_first") {
        if (a.is_bestseller && !b.is_bestseller) return -1;
        if (!a.is_bestseller && b.is_bestseller) return 1;
        return 0;
      }
      const aScore = (a.is_bestseller ? 2 : 0) + (a.is_new ? 1 : 0);
      const bScore = (b.is_bestseller ? 2 : 0) + (b.is_new ? 1 : 0);
      return bScore - aScore;
    });


  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(88, 28, 135, 0.97)', borderBottom: '1px solid rgba(126, 34, 206, 0.4)' }}>
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center text-sm font-medium shadow-md">
                <ArrowLeft className="h-4 w-4 mr-1" /> На главную
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: '#ffffff' }}>{filteredProducts.length} шт</span>
              <CartDrawer />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant={seasonFilter === "Зима" ? "default" : "outline"}
              size="sm"
              onClick={() => setSeasonFilter(seasonFilter === "Зима" ? null : "Зима")}
              className={`h-8 px-3 text-xs ${seasonFilter === "Зима" ? "bg-blue-600 hover:bg-blue-700" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}
              data-testid="button-season-winter"
            >
              <Snowflake className="h-3.5 w-3.5 mr-1" /> Зима
            </Button>
            <Button
              variant={seasonFilter === "Лето" ? "default" : "outline"}
              size="sm"
              onClick={() => setSeasonFilter(seasonFilter === "Лето" ? null : "Лето")}
              className={`h-8 px-3 text-xs ${seasonFilter === "Лето" ? "bg-orange-500 hover:bg-orange-600" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}
              data-testid="button-season-summer"
            >
              <Sun className="h-3.5 w-3.5 mr-1" /> Лето
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 px-3 text-xs ${genderFilter !== "Все" ? "bg-purple-600 hover:bg-purple-700 border-purple-600" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}
                  data-testid="button-gender-dropdown"
                >
                  <Users className="h-3.5 w-3.5 mr-1" /> 
                  {genderFilter === "Все" ? "Пол" : genderFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setGenderFilter("Все")} data-testid="menu-gender-all">
                  {genderFilter === "Все" && <Check className="h-4 w-4 mr-2" />}
                  <span className={genderFilter !== "Все" ? "ml-6" : ""}>Все</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGenderFilter("Женские")} data-testid="menu-gender-women">
                  {genderFilter === "Женские" && <Check className="h-4 w-4 mr-2" />}
                  <span className={genderFilter !== "Женские" ? "ml-6" : ""}>Женские</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGenderFilter("Мужские")} data-testid="menu-gender-men">
                  {genderFilter === "Мужские" && <Check className="h-4 w-4 mr-2" />}
                  <span className={genderFilter !== "Мужские" ? "ml-6" : ""}>Мужские</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGenderFilter("Детские")} data-testid="menu-gender-kids">
                  {genderFilter === "Детские" && <Check className="h-4 w-4 mr-2" />}
                  <span className={genderFilter !== "Детские" ? "ml-6" : ""}>Детские</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 px-3 text-xs ${showNewOnly || sortOption !== "default" ? "bg-green-600 hover:bg-green-700 border-green-600" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}
                  data-testid="button-filter-dropdown"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-1" /> Фильтры
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Показать</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setShowNewOnly(!showNewOnly)} data-testid="menu-filter-new">
                  {showNewOnly && <Check className="h-4 w-4 mr-2" />}
                  <Sparkles className={`h-4 w-4 mr-2 text-green-500 ${!showNewOnly ? "ml-6" : ""}`} />
                  Только новинки
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Сортировка</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSortOption("default")} data-testid="menu-sort-default">
                  {sortOption === "default" && <Check className="h-4 w-4 mr-2" />}
                  <span className={sortOption !== "default" ? "ml-6" : ""}>По умолчанию</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("new_first")} data-testid="menu-sort-new">
                  {sortOption === "new_first" && <Check className="h-4 w-4 mr-2" />}
                  <Sparkles className={`h-4 w-4 mr-2 text-green-500 ${sortOption !== "new_first" ? "ml-6" : ""}`} />
                  Сначала новые
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("popular_first")} data-testid="menu-sort-popular">
                  {sortOption === "popular_first" && <Check className="h-4 w-4 mr-2" />}
                  <Flame className={`h-4 w-4 mr-2 text-orange-500 ${sortOption !== "popular_first" ? "ml-6" : ""}`} />
                  Сначала популярные
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
