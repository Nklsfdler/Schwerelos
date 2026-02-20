import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";

import Script from "next/script";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700", "900"], variable: "--font-dm" });

export const metadata: Metadata = {
    metadataBase: new URL("https://schwerelos.art"),
    title: "Schwerelos | NFD Niklas Fiedler Design",
    description: "Eine semantische Studie der Leichtigkeit von NFD Niklas Fiedler Design.",
    icons: {
        icon: "/logos/favicon.png?v=4",
        apple: "/logos/favicon.png?v=4",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="de" className="scroll-smooth">
            <body className={`${outfit.variable} ${dmSans.variable} font-sans antialiased`}>
                {children}
                <Script strategy="lazyOnload" type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js" />
            </body>
        </html>
    );
}
