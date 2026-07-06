// import Header from '@/components/Header';
// import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}

      <main className="flex-1">
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                About The Old Attic
              </h1>
              <p className="mt-4 text-base leading-7 text-gray-600">
                We’re a small shop dedicated to bringing timeless finds and unique
                pieces back to life—curated with care, sourced with intention, and
                loved for years.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Our Story</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  The Old Attic started as a love letter to the past—rediscovering
                  character, craftsmanship, and stories hidden in everyday places.
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Our Promise</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Every item is chosen to be more than just “old”—it should feel
                  special, durable, and worth keeping.
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">How We Help</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Need the right piece? We’re here to guide you from product
                  selection to delivery.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  What you’ll find here
                </h2>
                <ul className="mt-6 space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gray-900" />
                    Curated vintage & reclaimed essentials
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gray-900" />
                    Small-batch drops and seasonal favorites
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gray-900" />
                    Quality you can feel—and keep
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-gray-900 p-8 text-white">
                <h3 className="text-lg font-semibold">Want to collaborate?</h3>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Whether you have items to offer, partnership ideas, or questions,
                  we’d love to hear from you.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="mailto:hello@theoldattic.example"
                    className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white/90"
                  >
                    Email us
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Contact page
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* <Footer /> */}
    </div>
  );
}
