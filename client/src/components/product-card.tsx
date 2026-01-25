import { motion } from "framer-motion";
import { Product } from "@/lib/products";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart";
import { ZoomIn, X } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const { addItem } = useCart();

  const [orderOpen, setOrderOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(product.min_order_quantity);

  const allPhotos = [
    product.main_photo,
    ...(product.additional_photos || []),
  ].filter(Boolean);

  const handleAddToCart = () => {
    addItem(product, product.min_order_quantity, "");
    toast({
      title: "Добавлено в корзину",
      description: `${product.name} — ${product.min_order_quantity} пар`,
    });
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      const response = await fetch("/api/orders/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          quantity,
          customerName: formData.get("name"),
          customerPhone: formData.get("phone"),
          totalPrice: product.price * quantity,
