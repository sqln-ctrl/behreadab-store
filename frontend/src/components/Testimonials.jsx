import React from "react";

const testimonials = [
  {
    id: 1,
    name: "Ali Khan",
    review:
      "Excellent quality and fast delivery. The watch exceeded my expectations.",
  },
  {
    id: 2,
    name: "Sarah Ahmed",
    review:
      "Beautiful design and premium packaging. Highly recommended.",
  },
  {
    id: 3,
    name: "Usman Tariq",
    review:
      "Affordable prices with luxury feel. Will definitely buy again.",
  },
];

const Testimonials = () => {
  return (
    <section className="bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="text-4xl font-bold text-center mb-12">
          What Our Customers Say
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <p className="text-gray-600 mb-4">
                "{item.review}"
              </p>

              <h4 className="font-bold">
                {item.name}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;