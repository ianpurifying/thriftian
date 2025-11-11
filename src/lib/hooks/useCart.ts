// src/lib/hooks/useCart.ts
"use client";

import { useState, useEffect } from "react";

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stock: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));
  };

  const addItem = (item: CartItem) => {
    const existing = items.find((i) => i.productId === item.productId);

    if (existing) {
      const newItems = items.map((i) =>
        i.productId === item.productId
          ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
          : i
      );
      saveCart(newItems);
    } else {
      saveCart([...items, item]);
    }
  };

  const removeItem = (productId: string) => {
    saveCart(items.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const newItems = items.map((i) =>
      i.productId === productId
        ? { ...i, quantity: Math.min(Math.max(1, quantity), i.stock) }
        : i
    );
    saveCart(newItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount: items.length,
  };
}
