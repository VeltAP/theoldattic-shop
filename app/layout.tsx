import type { Metadata } from "next";
// import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// const display = Playfair_Display({
//   variable: "--font-display",
//   subsets: ["latin"],
//   display: "swap",
// });

// const body = Inter({
//   variable: "--font-body",
//   subsets: ["latin"],
//   display: "swap",
// });

export const metadata: Metadata = {
  title: "The Old Attic",
  description: "Vintage lighting and furniture shop",
};

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html
//       lang="en"
//       className={`${display.variable} ${body.variable} h-full antialiased`}
//     >
//       <body className="min-h-full flex flex-col font-body bg-shop-bg text-shop-text">
//         {children}
//       </body>
//     </html>
//   );
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-shop-bg text-shop-text font-body">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}