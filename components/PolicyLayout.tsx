import Link from "next/link";

type PolicyLayoutProps = {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
};

export default function PolicyLayout({
  title,
  lastUpdated,
  children,
}: PolicyLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <Link
        href="/"
        className="text-sm text-shop-accent hover:underline mb-6 inline-block"
      >
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl md:text-4xl mb-2">{title}</h1>
      <p className="text-sm text-gray-500 mb-8 md:mb-10">
        Last updated: {lastUpdated}
      </p>

      <div
        className="space-y-4 text-sm md:text-base text-gray-700 leading-7
                   [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-normal
                   [&_h2]:text-shop-text [&_h2]:mt-8 [&_h2]:mb-3
                   [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                   [&_li]:text-gray-700
                   [&_a]:text-shop-accent [&_a]:hover:underline
                   [&_strong]:font-semibold [&_strong]:text-shop-text"
      >
        {children}
      </div>
    </div>
  );
}