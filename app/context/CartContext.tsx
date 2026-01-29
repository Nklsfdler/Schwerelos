"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
