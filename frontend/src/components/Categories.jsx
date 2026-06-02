import React from "react";

const categories = [
  {
    id: 1,
    name: "Men's Watches",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
  },
  {
    id: 2,
    name: "Women's Watches",
    image:
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6",
  },
];

const Categories = () => {
  return (
    <section className="max-w-7xl mx-auto px-8 py-16">
      <h2 className="text-4xl font-bold text-center mb-12">
        Shop By Category
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {categories.map((category) => (
          <div
            key={category.id}
            className="relative overflow-hidden rounded-xl group cursor-pointer"
          >
            <img
              src={category.image}
              alt={category.name}
              className="h-96 w-full object-cover group-hover:scale-110 transition duration-500"
            />

            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h3 className="text-white text-3xl font-bold">
                {category.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;