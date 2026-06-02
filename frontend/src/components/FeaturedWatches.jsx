
import ProductCard from "./ProductCard";
const featuredWatches = [
  {
    id: 1,
    name: "Rolex Submariner",
    price: 299,
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
  },
  {
    id: 2,
    name: "Classic Luxury",
    price: 249,
    image:
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa",
  },
  {
    id: 3,
    name: "Modern Smart Watch",
    price: 199,
    image:
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9",
  },
];

function FeaturedWatches() {
    return(
        <section className="max-w-7xl mx-auto px-8 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">
          Featured Watches
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredWatches.map((watch) => (
            <ProductCard
              key={watch.id}
              image={watch.image}
              name={watch.name}
              price={watch.price}
            />
          ))}
        </div>
      </section>
    );
}

export default FeaturedWatches;