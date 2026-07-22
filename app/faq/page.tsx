const faqs = [
  {
    q: "Do you ship worldwide?",
    a: "Absolutely! We ship from Slovenia (EU) to customers all around the world. Whether you're in the USA, Canada, the UK, Europe, Singapore, Japan, or elsewhere—we've got you covered. Each item listing shows the shipping cost, but you're always welcome to contact us if you'd like us to confirm the best shipping option.",
  },
  {
    q: "What is the delivery time?",
    a: "European countries: 7-10 business days. USA: 14-28 business days. Canada: 14-28 business days. UK: 14-28 business days. Australia: 21-28 business days. Rest of the world: 21-35 business days. These are estimated delivery times and may vary due to customs processing or other factors beyond our control.",
  },
  {
    q: "Can you ship faster?",
    a: "Yes! We can ship with DHL Express or FedEx First Priority, which usually delivers within 2-4 business days. Please contact us for a shipping quote. Keep in mind that express shipping can be quite expensive, especially for larger items.",
  },
  {
    q: "How do you pack your items?",
    a: "Our team has many years of experience securely packing fragile vintage items. We use double-layer packaging: an inner layer of cardboard, bubble wrap, and styrofoam, and a custom-made plywood outer box. We also use eco-friendly materials whenever possible, and the wooden crates can be reused for storage.",
  },
  {
    q: "Will I get tracking information for my package?",
    a: "Yes. As soon as your order has been shipped, we will send you the courier information together with your tracking number.",
  },
  {
    q: "What if my item arrives damaged? Is the package insured?",
    a: "Yes. Every shipment is fully insured for its full value. If your item arrives damaged, please contact us as soon as possible and send us photos of both the item and the packaging. We will immediately start a claim with the courier.",
  },
  {
    q: "Will I need to pay customs fees?",
    a: "We are located in Slovenia, European Union. Customers within the EU do not pay customs fees. Customers outside the EU may need to pay import duties or taxes depending on their country's regulations. These typically range from 11-25%, but please check with your local customs office for the exact amount.",
  },
  {
    q: "Can your lamps be used in the US?",
    a: "Yes. Our lamps are suitable for use with the US electrical system. You only need to purchase compatible light bulbs. For table lamps, you may also need a simple plug adapter.",
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      <h1 className="text-4xl text-center font-display mb-4">
        Frequently Asked Questions
      </h1>

      <p className="text-center text-gray-600 mb-10">
        Here are the answers to the questions we receive most often.
      </p>

      <div>
        {faqs.map((item) => (
          <details
            key={item.q}
            className="border border-gray-300 rounded mb-4 p-4"
          >
            <summary className="font-semibold cursor-pointer">
              {item.q}
            </summary>

            <p className="mt-3 text-gray-700 leading-7">
              {item.a}
            </p>
          </details>
        ))}
      </div>

      <div className="text-center mt-12">
        <h2 className="text-2xl font-display mb-3">
          Still have questions?
        </h2>

        <p className="text-gray-600 mb-6">
          If you cannot find the answer you are looking for, feel free to contact us.
        </p>

        <a
          href="/contact"
          className="inline-block border border-gray-300 px-6 py-3 rounded hover:bg-gray-100"
        >
          Contact Us
        </a>
      </div>

    </div>
  );
}