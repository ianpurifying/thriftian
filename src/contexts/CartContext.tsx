// src/contexts/CartContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));
  };

  const addItem = (item: CartItem) => {
    const existing = items.find((i) => i.productId === item.productId);
    if (existing) {
      saveCart(
        items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
            : i
        )
      );
    } else {
      saveCart([...items, item]);
    }
  };

  const removeItem = (productId: string) =>
    saveCart(items.filter((i) => i.productId !== productId));
  const updateQuantity = (productId: string, quantity: number) =>
    saveCart(
      items.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(Math.max(1, quantity), i.stock) }
          : i
      )
    );
  const clearCart = () => saveCart([]);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0), // actual quantity
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
