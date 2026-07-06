// import Header from '@/components/Header';
// import Footer from '@/components/Footer';

const faqs = [
  {
    q: 'What kinds of items do you sell?',
    a: 'We focus on vintage, reclaimed, and timeless pieces—curated for character, quality, and long-term enjoyment.',
  },
  {
    q: 'How do you choose what to stock?',
    a: 'We look for craftsmanship, condition, and whether the item has real “keep it” value. If it doesn’t meet our standards, it won’t make the list.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Shipping availability depends on your location. Check the shipping options at checkout for the most accurate details.',
  },
  {
    q: 'Can I request a specific item?',
    a: 'Yes—if you’re looking for something specific, reach out via the contact page and include details like style, size, and timeframe.',
  },
  {
    q: 'How should I care for vintage/reclaimed items?',
    a: 'Care varies by material, but we recommend following the guidance provided on the product page. When in doubt, contact us and we’ll help.',
  },
  {
    q: 'How do returns work?',
    a: 'Return eligibility depends on the item and its condition. See our return policy for timelines and instructions, or contact us for help.',
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}

      <main className="flex-1">
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Frequently Asked Questions
              </h1>
              <p className="mt-4 text-base leading-7 text-gray-600">
                Quick answers to common questions. If you don’t see what you’re
                looking for, contact us and we’ll help.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white shadow-sm">
                  {faqs.map((item, idx) => (
                    <details
                      key={item.q}
                      className="group p-6 [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="cursor-pointer list-none">
                        <div className="flex items-start justify-between gap-4">
                          <h2 className="text-base font-semibold text-gray-900">
                            {item.q}
                          </h2>
                          <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition group-open:bg-gray-900 group-open:text-white">
                            {idx + 1}
                          </span>
                        </div>
                        <p className="mt-2 hidden text-sm leading-6 text-gray-600 group-open:block">
                          {item.a}
                        </p>
                      </summary>

                      <div className="mt-3 text-sm leading-6 text-gray-600 group-open:block">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              <aside className="lg:col-span-1">
                <div className="rounded-2xl bg-gray-900 p-8 text-white">
                  <h3 className="text-lg font-semibold">Still have questions?</h3>
                  <p className="mt-2 text-sm leading-6 text-white/80">
                    Send us a message and we’ll respond as soon as possible.
                  </p>
                  <div className="mt-6 flex flex-col gap-3">
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
              </aside>
            </div>
          </div>
        </section>
      </main>

      {/* <Footer /> */}
    </div>
  );
}
