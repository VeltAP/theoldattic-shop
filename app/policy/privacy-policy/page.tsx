import PolicyLayout from "@/components/PolicyLayout";

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout title="Privacy Policy" lastUpdated="July 11, 2026">
      <p>
        This policy explains what information we collect when you use our
        website, and how it&apos;s used. We keep this simple and don&apos;t collect
        anything beyond what&apos;s needed to run the shop and fulfill your
        orders.
      </p>

      <h2>Information We Collect</h2>
      <ul>
        <li>
          <strong>Contact form submissions</strong> — your name, email
          address, and message, when you reach out to us.
        </li>
        <li>
          <strong>Order information</strong> — your email, phone number,
          and shipping address, collected securely through Stripe at
          checkout so we can fulfill and ship your order.
        </li>
        <li>
          <strong>Cart contents</strong> — stored locally in your browser
          so your cart survives a page refresh. This never leaves your
          device unless you complete a purchase.
        </li>
      </ul>
      <p>
        We do not require an account to browse or purchase, so we don&apos;t
        store passwords or profiles for customers.
      </p>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To process and ship your order.</li>
        <li>To respond to messages sent through our Contact form.</li>
        <li>To keep a record of past orders for our own accounting.</li>
      </ul>
      <p>
        We do not sell, rent, or share your personal information with third
        parties for marketing purposes.
      </p>

      <h2>Third-Party Services</h2>
      <p>
        We use a small number of trusted services to run this shop, and
        each handles a specific piece of your information:
      </p>
      <ul>
        <li>
          <strong>Stripe</strong> — processes payments and collects your
          shipping address and phone number. We never see or store your
          full card details; Stripe handles that securely.
        </li>
        <li>
          <strong>Supabase</strong> — stores our product catalog and order
          records securely.
        </li>
        <li>
          <strong>Resend</strong> — delivers the emails sent through our
          Contact form.
        </li>
      </ul>

      <h2>Cookies & Local Storage</h2>
      <p>
        We use your browser&apos;s local storage to remember your cart contents.
        We don&apos;t use tracking or advertising cookies.
      </p>

      <h2>Your Rights</h2>
      <p>
        You can ask us at any time what information we hold about you, or
        request that it be deleted, by contacting us through our{" "}
        <a href="/contact">Contact page</a>. Note that we may need to
        retain order records for accounting and legal purposes even after a
        deletion request.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        If this policy changes, we&apos;ll update the date at the top of this
        page. Continued use of the site after changes means you accept the
        updated policy.
      </p>
    </PolicyLayout>
  );
}