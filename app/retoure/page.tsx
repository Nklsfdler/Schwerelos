"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Search, Package, RotateCcw, Truck, Mail, CheckCircle2, ChevronRight } from "lucide-react";

/* ─── FAKE ORDER DATA (Demo) ─── */
function generateFakeOrder(orderId: string) {
    return {
        orderId,
        product: "Schwerelos — Edition 01",
        price: "33,99 €",
        status: "Zugestellt",
        date: "18. Februar 2026",
        tracking: "JD123456789012345678",
    };
}

/* ─── STEP INDICATOR ─── */
function ReturnStep({ number, title, description, icon }: { number: number; title: string; description: string; icon: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: number * 0.15 }}
            className="flex gap-4"
        >
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0">
                    {icon}
                </div>
                {number < 4 && <div className="w-[1px] h-8 bg-gradient-to-b from-blue-500/20 to-transparent" />}
            </div>
            <div className="pb-4">
                <p className="text-xs text-white/30 uppercase tracking-widest font-bold mb-1">Schritt {number}</p>
                <p className="text-sm font-bold text-white/80">{title}</p>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">{description}</p>
            </div>
        </motion.div>
    );
}

export default function RetourePage() {
    const [orderId, setOrderId] = useState("");
    const [email, setEmail] = useState("");
    const [orderFound, setOrderFound] = useState<ReturnType<typeof generateFakeOrder> | null>(null);
    const [returnRequested, setReturnRequested] = useState(false);
    const [error, setError] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setOrderFound(null);

        if (!orderId.trim()) {
            setError("Bitte gib deine Bestellnummer ein.");
            return;
        }
        if (!email.trim() || !email.includes("@")) {
            setError("Bitte gib eine gültige E-Mail-Adresse ein.");
            return;
        }

        setIsSearching(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1200));

        if (orderId.startsWith("SCH-")) {
            setOrderFound(generateFakeOrder(orderId));
        } else {
            setError("Keine Bestellung mit dieser Nummer gefunden. Bitte überprüfe deine Eingaben.");
        }
        setIsSearching(false);
    };

    const handleReturnRequest = async () => {
        setIsSearching(true);
        await new Promise(r => setTimeout(r, 1000));
        setReturnRequested(true);
        setIsSearching(false);
    };

    return (
        <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/[0.02] blur-[150px] pointer-events-none" />

            <div className="relative max-w-2xl mx-auto px-6 py-16">
                {/* Back Link */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Zurück zur Website
                    </Link>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <RotateCcw className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-[family-name:var(--font-outfit)] font-bold">
                                Retoure & Bestellstatus
                            </h1>
                        </div>
                    </div>
                    <p className="text-white/40 text-sm leading-relaxed max-w-lg font-[family-name:var(--font-dm)]">
                        Hier kannst du den Status deiner Bestellung einsehen und bei Bedarf eine Retoure anmelden.
                        Du hast <strong className="text-white/60">14 Tage Widerrufsrecht</strong> ab Erhalt der Ware.
                    </p>
                </motion.div>

                {/* Search Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-10"
                >
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">
                                    Bestellnummer
                                </label>
                                <input
                                    type="text"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    placeholder="SCH-2026-123456"
                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 outline-none focus:border-blue-500/50 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.15)] transition-all font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">
                                    E-Mail-Adresse
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="deine@email.de"
                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 outline-none focus:border-blue-500/50 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.15)] transition-all font-[family-name:var(--font-dm)]"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-sm"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={isSearching}
                            className="w-full py-4 bg-white text-black font-[family-name:var(--font-outfit)] font-bold uppercase tracking-widest rounded-full hover:bg-blue-50 transition-all disabled:opacity-40 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                            {isSearching ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    Suche...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Search className="w-4 h-4" />
                                    Bestellung suchen
                                </span>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Order Found */}
                <AnimatePresence>
                    {orderFound && !returnRequested && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Order Card */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <Package className="w-4 h-4 text-blue-400" />
                                    <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold">Bestelldetails</h3>
                                </div>

                                <div className="flex items-center gap-4 pb-5 border-b border-white/8 mb-5">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                                        <img src="/Produktbilder/Produktbild.png" className="w-full h-full object-cover opacity-70" alt="Schwerelos" />
                                    </div>
                                    <div>
                                        <p className="font-[family-name:var(--font-outfit)] font-bold text-white">{orderFound.product}</p>
                                        <p className="text-xs text-white/40 mt-0.5">Bestellnummer: {orderFound.orderId}</p>
                                    </div>
                                    <p className="text-sm font-bold text-white/70 ml-auto">{orderFound.price}</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-xs text-white/35">Status</span>
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 font-medium">
                                            {orderFound.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-white/35">Bestelldatum</span>
                                        <span className="text-xs text-white/70">{orderFound.date}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-white/35">Sendungsnummer</span>
                                        <span className="text-xs text-white/70 font-mono">{orderFound.tracking}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-white/35">Versandart</span>
                                        <span className="text-xs text-white/70">DHL Expressversand</span>
                                    </div>
                                </div>

                                <a
                                    href={`https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=${orderFound.tracking}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 mt-5 text-sm text-blue-400 hover:text-blue-300 transition-colors group"
                                >
                                    <Truck className="w-4 h-4" />
                                    <span className="group-hover:underline">Sendung bei DHL verfolgen</span>
                                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>

                            {/* Return Button */}
                            <button
                                onClick={handleReturnRequest}
                                disabled={isSearching}
                                className="w-full py-4 bg-white/5 border border-white/10 text-white font-[family-name:var(--font-outfit)] font-bold uppercase tracking-widest rounded-full hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-40"
                            >
                                {isSearching ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Wird verarbeitet...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <RotateCcw className="w-4 h-4" />
                                        Retoure anmelden
                                    </span>
                                )}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Return Requested — Success + Instructions */}
                <AnimatePresence>
                    {returnRequested && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Success Banner */}
                            <div className="bg-green-500/5 border border-green-500/20 rounded-3xl p-6 text-center">
                                <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
                                <h3 className="text-lg font-[family-name:var(--font-outfit)] font-bold text-green-400 mb-1">
                                    Retoure angemeldet
                                </h3>
                                <p className="text-sm text-white/40">
                                    Für Bestellung <span className="font-mono text-white/60">{orderFound?.orderId}</span>
                                </p>
                                <p className="text-xs text-white/30 mt-2">
                                    Eine Bestätigung wurde an <span className="text-white/50">{email}</span> gesendet.
                                </p>
                            </div>

                            {/* Step-by-Step Instructions */}
                            <div>
                                <h3 className="text-xs uppercase tracking-widest text-white/30 font-bold mb-6">
                                    So sendest du deine Bestellung zurück
                                </h3>

                                <ReturnStep
                                    number={1}
                                    title="Artikel sicher verpacken"
                                    description="Verpacke den Artikel in der Originalverpackung oder einer gleichwertigen, sicheren Verpackung. Stelle sicher, dass der Artikel unbeschädigt und unbenutzt ist."
                                    icon={<Package className="w-4 h-4 text-blue-400" />}
                                />
                                <ReturnStep
                                    number={2}
                                    title="Retourenschein beilegen"
                                    description="Drucke die Bestätigungsmail aus und lege sie dem Paket bei. Alternativ schreibe deine Bestellnummer auf einen Zettel."
                                    icon={<Mail className="w-4 h-4 text-blue-400" />}
                                />
                                <ReturnStep
                                    number={3}
                                    title="Paket an uns senden"
                                    description="Sende das Paket an: Schwerelos GmbH, Musterstraße 1, 85049 Ingolstadt. Die Rücksendekosten trägst du selbst."
                                    icon={<Truck className="w-4 h-4 text-blue-400" />}
                                />
                                <ReturnStep
                                    number={4}
                                    title="Erstattung erhalten"
                                    description="Nach Eingang und Prüfung der Retoure erstatten wir dir den Kaufpreis innerhalb von 5–7 Werktagen auf dein ursprüngliches Zahlungsmittel."
                                    icon={<CheckCircle2 className="w-4 h-4 text-blue-400" />}
                                />
                            </div>

                            {/* Contact */}
                            <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
                                <p className="text-xs text-white/40 font-bold mb-2">Fragen zur Retoure?</p>
                                <p className="text-xs text-white/30 leading-relaxed">
                                    Kontaktiere uns unter{" "}
                                    <a href="mailto:hallo@nfd.studio" className="text-blue-400 hover:underline">hallo@nfd.studio</a>
                                    {" "}— wir helfen dir gerne weiter.
                                </p>
                            </div>

                            {/* Back */}
                            <div className="text-center pt-4">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-[family-name:var(--font-outfit)] font-bold uppercase tracking-widest rounded-full hover:bg-blue-50 transition-all text-sm relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                                    <ArrowLeft className="w-4 h-4 relative" />
                                    <span className="relative">Zurück zur Website</span>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* No Order Found — Show FAQ */}
                {!orderFound && !returnRequested && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-6 pt-4"
                    >
                        <div className="border-t border-white/5 pt-10">
                            <h3 className="text-xs uppercase tracking-widest text-white/25 font-bold mb-6">
                                Häufige Fragen
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                                    <p className="text-sm font-bold text-white/60 mb-1">Wo finde ich meine Bestellnummer?</p>
                                    <p className="text-xs text-white/30 leading-relaxed">
                                        Deine Bestellnummer findest du in der Bestätigungs-E-Mail, die du nach deiner Bestellung erhalten hast.
                                        Sie beginnt mit &quot;SCH-&quot; gefolgt von einer Zahlenkombination.
                                    </p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                                    <p className="text-sm font-bold text-white/60 mb-1">Wie lange habe ich Zeit für eine Retoure?</p>
                                    <p className="text-xs text-white/30 leading-relaxed">
                                        Du hast 14 Tage Widerrufsrecht ab Erhalt der Ware. Der Artikel muss unbenutzt und in der Originalverpackung sein.
                                    </p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                                    <p className="text-sm font-bold text-white/60 mb-1">Wer trägt die Rücksendekosten?</p>
                                    <p className="text-xs text-white/30 leading-relaxed">
                                        Die Kosten für die Rücksendung trägst du selbst. Wir empfehlen, die Rücksendung als versichertes Paket zu versenden.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Direct Contact */}
                        <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-5 text-center">
                            <p className="text-xs text-blue-300/70 leading-relaxed">
                                Du möchtest uns direkt kontaktieren? Schreib uns an{" "}
                                <a href="mailto:hallo@nfd.studio" className="text-blue-400 hover:underline font-bold">hallo@nfd.studio</a>
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Branding */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-20 text-center text-[10px] text-white/10 uppercase tracking-widest"
                >
                    NFD Niklas Fiedler Design · nfd.studio
                </motion.p>
            </div>
        </div>
    );
}
