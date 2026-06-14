const Rating = ({ value, count, size = "sm" }) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(value)) return "full";
    if (i < value) return "half";
    return "empty";
  });

  const sz = size === "lg" ? "text-lg" : "text-sm";

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex ${sz}`}>
        {stars.map((type, i) => (
          <span
            key={i}
            style={{ color: type !== "empty" ? "#d4af37" : "#d1d5db" }}
          >
            {type === "full" ? "★" : type === "half" ? "⯨" : "☆"}
          </span>
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-400">({count})</span>
      )}
    </div>
  );
};

export default Rating;
