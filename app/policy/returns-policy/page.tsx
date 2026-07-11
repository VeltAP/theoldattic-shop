import PolicyLayout from "@/components/PolicyLayout";

export default function ReturnsPolicyPage() {
  return (
    <PolicyLayout title="Returns & Refunds" lastUpdated="July 11, 2026">
      <p>
        Because we sell one-of-a-kind vintage items, our returns policy
        works a little differently than a typical shop selling new,
        mass-produced products. Please read the details below before
        purchasing.
      </p>

      <h2>The Nature of Vintage Items</h2>
      <p>
        Every piece we sell has genuine age, and may show normal signs of
        wear consistent with its history — small marks, patina, minor
        fading, or other character that comes with being a real vintage
        find. This isn&apos;t a defect; it&apos;s part of what makes the piece
        authentic. We do our best to photograph and describe each item
        honestly so there are no surprises.
      </p>

      <h2>Cancellations</h2>
      <p>
        You may cancel an order for a full refund any time before it has
        shipped. Contact us as soon as possible if you&apos;d like to cancel —
        once an item has been dispatched, it falls under the return terms
        below instead.
      </p>

      <h2>Returns</h2>
      <p>
        Since each item is unique and stock is limited to one of each
        piece, we&apos;re only able to accept returns in the following cases:
      </p>
      <ul>
        <li>The item arrived significantly different from its description or photos.</li>
        <li>The item was damaged in transit.</li>
        <li>The wrong item was sent.</li>
      </ul>
      <p>
        To request a return, contact us within 7 days of delivery with your
        order number and photos of the item. We&apos;ll confirm next steps by
        email.
      </p>

      <h2>What&apos;s Not Covered</h2>
      <p>
        We&apos;re not able to accept returns for change of mind, or for normal
        signs of age that were visible in the listing photos and
        description. Please review photos and measurements carefully before
        ordering, and reach out with any questions beforehand.
      </p>

      <h2>Refunds</h2>
      <p>
        Once a return is approved and the item is received back in its
        original condition, we&apos;ll issue a refund to your original payment
        method. Refunds are typically processed within 5–10 business days,
        depending on your bank or card provider. Original shipping costs
        are non-refundable unless the return is due to our error or damage
        in transit.
      </p>

      <h2>Questions</h2>
      <p>
        If anything is unclear, reach out through our{" "}
        <a href="/contact">Contact page</a> and we&apos;ll be happy to help.
      </p>
    </PolicyLayout>
  );
}