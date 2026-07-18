import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { CookieConsentProvider } from "@/context/CookieConsentContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "The Old Attic",
  description: "Vintage lighting and furniture shop",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <CartProvider>
          <FavoritesProvider>
            <RecentlyViewedProvider>
              <CookieConsentProvider>
                <Header />
                {children}
                <Footer />
                <CookieBanner />
                <GoogleAnalytics />
              </CookieConsentProvider>
            </RecentlyViewedProvider>
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}