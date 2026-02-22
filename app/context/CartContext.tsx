"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type CartContextType = {
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    isCheckoutOpen: boolean;
    openCheckout: () => void;
    closeCheckout: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Hydrate state from sessionStorage on mount
    useEffect(() => {
        setIsMounted(true);
        const storedCart = sessionStorage.getItem("cartOpen");
        const storedCheckout = sessionStorage.getItem("checkoutOpen");

        if (storedCart === "true") setIsOpen(true);
        if (storedCheckout === "true") setIsCheckoutOpen(true);

        // Optional: restore scroll position if page was reloaded
        const scrollPos = sessionStorage.getItem("scrollPosition");
        if (scrollPos) {
            window.scrollTo(0, parseInt(scrollPos, 10));
            sessionStorage.removeItem("scrollPosition");
        }

        const handleBeforeUnload = () => {
            sessionStorage.setItem("scrollPosition", window.scrollY.toString());
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);

    // Sync state to sessionStorage whenever it changes
    useEffect(() => {
        if (!isMounted) return;
        sessionStorage.setItem("cartOpen", isOpen.toString());
        sessionStorage.setItem("checkoutOpen", isCheckoutOpen.toString());
    }, [isOpen, isCheckoutOpen, isMounted]);

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);

    const openCheckout = () => {
        setIsOpen(false);
        setIsCheckoutOpen(true);
    };
    const closeCheckout = () => setIsCheckoutOpen(false);

    return (
        <CartContext.Provider value={{ isOpen, openCart, closeCart, isCheckoutOpen, openCheckout, closeCheckout }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
