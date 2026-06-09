import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <motion.button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        whileTap={{ scale: 0.9 }}
        className="w-9 h-9 rounded-full flex items-center justify-center border text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-yellow-500 transition"
      >
        <FaChevronLeft className="text-xs" />
      </motion.button>

      {pages.map((page) => (
        <motion.button
          key={page}
          onClick={() => onPageChange(page)}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border transition"
          style={{
            background: currentPage === page ? "#d4af37" : "transparent",
            borderColor: currentPage === page ? "#d4af37" : "#e5e7eb",
            color: currentPage === page ? "#000" : "#6b7280",
          }}
        >
          {page}
        </motion.button>
      ))}

      <motion.button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        whileTap={{ scale: 0.9 }}
        className="w-9 h-9 rounded-full flex items-center justify-center border text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-yellow-500 transition"
      >
        <FaChevronRight className="text-xs" />
      </motion.button>
    </div>
  );
};

export default Pagination;
