import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
const Rating = ({ value = 0, count, size = "sm" }) => {
  const sz = size === "lg" ? "text-base" : "text-xs";
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(s => {
          if (value >= s)       return <FaStar      key={s} className={`${sz} text-yellow-400`} />;
          if (value >= s - 0.5) return <FaStarHalfAlt key={s} className={`${sz} text-yellow-400`} />;
          return <FaRegStar key={s} className={`${sz} text-gray-200`} />;
        })}
      </div>
      {count !== undefined && <span className="text-xs text-gray-400">({count})</span>}
    </div>
  );
};
export default Rating;
