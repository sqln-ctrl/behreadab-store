import { motion } from "framer-motion";

const PriceFilter = ({ minPrice, maxPrice, value, onChange }) => {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-500">Price</span>
        <span className="font-bold" style={{ color: "#d4af37" }}>
          ${value[0]} — ${value[1]}
        </span>
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={value[0]}
          onChange={(e) => onChange([Number(e.target.value), value[1]])}
          className="w-full accent-yellow-500"
        />
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={value[1]}
          onChange={(e) => onChange([value[0], Number(e.target.value)])}
          className="w-full accent-yellow-500"
        />
      </div>

      <div className="flex gap-2 mt-3">
        {[
          { label: "Under $200", range: [0, 200] },
          { label: "Under $300", range: [0, 300] },
          { label: "All", range: [minPrice, maxPrice] },
        ].map(({ label, range }) => (
          <motion.button
            key={label}
            onClick={() => onChange(range)}
            whileTap={{ scale: 0.95 }}
            className="text-xs px-3 py-1 rounded-full border transition-colors"
            style={{
              borderColor:
                value[0] === range[0] && value[1] === range[1]
                  ? "#d4af37"
                  : "#e5e7eb",
              color:
                value[0] === range[0] && value[1] === range[1]
                  ? "#d4af37"
                  : "#6b7280",
            }}
          >
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default PriceFilter;
