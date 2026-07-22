import LocationMap from "@/components/LocationMap";

export default function AboutPage() {
  return (
    <div className="bg-shop-bg text-shop-text">
      <div className="max-w-5xl mx-auto px-6 py-20">

        <div className="grid md:grid-cols-[1fr_auto] gap-12 items-center mb-24">

          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-shop-accent font-body mb-4">
              Est. 2016 · Ljubljana, Slovenia
            </p>

            <h1 className="text-5xl md:text-6xl font-display leading-[1.05] mb-8">
              A second life for pieces<br />worth keeping.
            </h1>

            <p className="max-w-xl leading-8 text-shop-text/80 font-body">
              What began as a shared hobby, an excuse to chase rare pieces
              through Europe&apos;s flea markets and estate sales, grew into a
              small family business. We hand-pick every item, restore it with
              care, and send it on to a new home, wherever in the world that
              might be.
            </p>
          </div>

          <div className="justify-self-center md:justify-self-end shrink-0">
            <div className="relative w-36 h-36 rounded-full border border-shop-accent/40 flex items-center justify-center rotate-[-6deg]">
              <div className="absolute inset-2 rounded-full border border-shop-accent/40" />
              <p className="text-center font-display text-shop-accent text-sm leading-tight px-4">
                Hand&#8209;picked
                <br />
                <span className="text-xs tracking-[0.15em] uppercase font-body">since 2016</span>
              </p>
            </div>
          </div>

        </div>

        <section className="mb-24">
          <SectionLabel>Styles We Seek</SectionLabel>

          <div className="flex flex-wrap gap-3 mb-6">
            {[
              "Mid-Century Modern",
              "Art Deco",
              "Brutalism",
              "Modernism",
              "Industrial",
              "Bohemian",
            ].map((style) => (
              <span
                key={style}
                className="text-sm font-body border border-shop-text/20 rounded-full px-4 py-1.5 hover:border-shop-accent hover:text-shop-accent transition-colors"
              >
                {style}
              </span>
            ))}
          </div>

          <p className="text-shop-text/70 font-body max-w-2xl">
            Authentic European vintage, primarily Italian, with carefully
            selected pieces from France, Germany, Austria and beyond.
          </p>
        </section>

        <section className="mb-24 grid md:grid-cols-2 gap-12">
          <div>
            <SectionLabel>How We Source</SectionLabel>
            <p className="leading-8 text-shop-text/80 font-body">
              Every piece is found individually. We work with small dealers,
              private collectors and antique markets throughout Europe.
              Building these relationships has taken more than a decade, and
              it&apos;s what lets us tell an original from a reproduction at
              a glance.
            </p>
          </div>

          <ul className="font-body divide-y divide-shop-text/15 border-t border-shop-text/15">
            {[
              "Small dealers across Italy",
              "Private collectors",
              "Estate sales",
              "Flea markets",
              "Antique fairs",
              "Hidden shops in small towns",
            ].map((source) => (
              <li key={source} className="py-3 flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-shop-accent shrink-0" />
                {source}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-24 grid md:grid-cols-2 gap-12">
          <div>
            <SectionLabel>Worldwide Shipping</SectionLabel>
            <p className="leading-8 text-shop-text/80 font-body">
              We proudly ship worldwide. Our pieces have already travelled to
              collectors in 52 countries, including the USA, Canada, the UK,
              France, Germany, Australia and Japan.
            </p>
          </div>

          <div>
            <SectionLabel>Packed With Care</SectionLabel>
            <p className="leading-8 text-shop-text/80 font-body">
              Every order is packed by hand in custom-made wooden crates with
              generous padding and recycled materials wherever possible.
              Every shipment is insured and tracked until it safely reaches
              its new owner.
            </p>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-24">
          <div className="grid grid-cols-2 md:grid-cols-5 border-t border-shop-text/20">
            {[
              ["1500+", "Total Orders"],
              ["971", "Etsy Sales"],
              ["4.9★", "Etsy Rating"],
              ["313", "Etsy Reviews"],
              ["2020", "On Etsy Since"],
            ].map(([value, label]) => (
              <div key={label} className="border-b md:border-b-0 md:border-r border-shop-text/20 last:border-r-0 py-6 px-2 text-center">
                <p className="text-3xl font-display text-shop-accent">{value}</p>
                <p className="text-xs tracking-[0.1em] uppercase text-shop-text/60 font-body mt-2">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-24">
          <SectionLabel center>Find Us On</SectionLabel>
          <div className="flex flex-wrap justify-center gap-3">
            {["Etsy", "Pamono", "Chairish", "1stDibs", "Selency", "Vinterior", "VNTG"].map(
              (site) => (
                <span
                  key={site}
                  className="text-sm font-body border border-shop-text/20 rounded px-4 py-2 text-shop-text/80"
                >
                  {site}
                </span>
              )
            )}
          </div>
        </section>

        <section className="mb-24 border-t border-shop-text/20 pt-10 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-shop-accent font-body mb-2">
            Follow the hunt
          </p>
          <p className="font-display text-xl mb-1">@old_attic.si</p>
          <p className="font-body text-sm text-shop-text/70 mb-6">
            New discoveries from flea markets and antique fairs, as we find them.
          </p>

          <p className="font-body text-sm text-shop-text/70 mb-3">
            Have a question about an item or shipping?
          </p>
          <a
            href="/contact"
            className="inline-block border border-shop-text/20 text-shop-text font-body text-sm tracking-wide rounded px-6 py-2.5 hover:border-shop-accent hover:text-shop-accent transition-colors"
          >
            Contact Us
          </a>
        </section>

        <section className="border-t border-shop-text/20 pt-10 text-center text-shop-text/70 font-body text-sm">
          <p className="font-display text-base text-shop-text mb-2">SIDK d.o.o.</p>
          <p>Miklavž pri Taboru 61a</p>
          <p>3304 Tabor, Slovenia</p>
          <p className="mt-3">+386 40 867 303 &nbsp;·&nbsp; +386 30 608 198</p>
          <p className="mt-3">theoldatticshop@gmail.com &nbsp;·&nbsp; VAT: SI3487559</p>
        </section>

        <section className="mb-24">
          <SectionLabel center>Find Us</SectionLabel>
          <LocationMap />
        </section>

      </div>
    </div>
  );
}

function SectionLabel({
  children,
  center = false,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <p
      className={`text-xs tracking-[0.2em] uppercase text-shop-accent font-body mb-5 ${
        center ? "text-center" : ""
      }`}
    >
      {children}
    </p>
  );
}