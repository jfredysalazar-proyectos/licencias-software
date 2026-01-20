import React, { createContext, useContext, useState, useEffect } from "react";
import type { Product } from "../../../drizzle/schema";

export interface SelectedVariant {
  variantId: number;
  variantName: string;
  optionId: number;
  optionValue: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: SelectedVariant[];
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, selectedVariants?: SelectedVariant[]) => void;
  removeFromCart: (productId: number, variantKey?: string) => void;
  updateQuantity: (productId: number, quantity: number, variantKey?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const getVariantKey = (variants?: SelectedVariant[]) => {
    if (!variants || variants.length === 0) return "";
    return variants.map(v => `${v.variantId}:${v.optionId}`).sort().join("|");
  };

  const addToCart = (product: Product, selectedVariants?: SelectedVariant[]) => {
    setCart((prevCart) => {
      const variantKey = getVariantKey(selectedVariants);
      const existingItem = prevCart.find(
        (item) => 
          item.product.id === product.id && 
          getVariantKey(item.selectedVariants) === variantKey
      );
      
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id && getVariantKey(item.selectedVariants) === variantKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1, selectedVariants }];
    });
  };

  const removeFromCart = (productId: number, variantKey?: string) => {
    setCart((prevCart) => 
      prevCart.filter((item) => {
        if (item.product.id !== productId) return true;
        if (variantKey === undefined) return false;
        return getVariantKey(item.selectedVariants) !== variantKey;
      })
    );
  };

  const updateQuantity = (productId: number, quantity: number, variantKey?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantKey);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id !== productId) return item;
        if (variantKey !== undefined && getVariantKey(item.selectedVariants) !== variantKey) return item;
        return { ...item, quantity };
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.basePrice * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
