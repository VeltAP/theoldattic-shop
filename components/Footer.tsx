export default function Footer() {
  return (
    <footer className="bg-shop-bg border-t border-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center font-body text-sm text-shop-text">
        <p>&copy; {new Date().getFullYear()} Vintage Shop. All items sold as-is, condition described per listing.</p>
      </div>
    </footer>
  );
}