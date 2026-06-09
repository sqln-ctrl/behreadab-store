import { motion } from "framer-motion";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchBar = ({ value, onChange, onClear }) => {
  return (
    <div className="relative flex items-center">
      <FaSearch className="absolute left-4 text-gray-400 text-sm pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search watches..."
        className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 transition-all"
        style={{ focusRingColor: "#d4af37" }}
      />
      {value && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onClear}
          className="absolute right-4 text-gray-400 hover:text-gray-700"
        >
          <FaTimes />
        </motion.button>
      )}
    </div>
  );
};

export default SearchBar;
