export default function LocationMap() {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  const address = encodeURIComponent(
    "The Old Attic, Miklavž pri Taboru 61a, 3304 Tabor, Slovenia"
  );

  return (
    <div className="w-full h-72 rounded overflow-hidden border border-shop-text/20">
      <iframe
        title="Shop location"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/place?key=${key}&q=${address}`}
      />
    </div>
  );
}