import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FaSlidersH, FaTimes } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import PriceFilter from "../components/PriceFilter";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";
import { productsAPI } from "../services/api";

const ITEMS_PER_PAGE = 12;
const SORT_OPTIONS = [
  { value: "default",    label: "Default" },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating",     label: "Top Rated" },
  { value: "newest",     label: "Newest" },
];

const Shop = () => {
  const [products,    setProducts]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [searchParams] = useSearchParams();
  const [search,      setSearch]      = useState("");
  const [category,    setCategory]    = useState(searchParams.get("category") || "All");
  const [priceRange,  setPriceRange]  = useState([0, 150000]);
  const [sort,        setSort]        = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const headerRef = useRef(null);
  const isInView  = useInView(headerRef, { once: true });

  const categories = ["All", "Men", "Women", "Unisex"];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        limit:  ITEMS_PER_PAGE,
        page:   currentPage,
        sort:   sort !== "default" ? sort : undefined,
      };
      if (search)             params.search   = search;
      if (category !== "All") params.category = category;
      if (priceRange[0] > 0)  params.minPrice = priceRange[0];
      if (priceRange[1] < 150000) params.maxPrice = priceRange[1];

      const { data } = await productsAPI.getAll(params);
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [search, category, priceRange, sort, currentPage]);

  const resetAll = () => {
    setSearch(""); setCategory("All"); setPriceRange([0, 150000]);
    setSort("default"); setCurrentPage(1);
  };

  const SidebarContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest mb-3 text-gray-500">Search</h3>
        <SearchBar value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }}
          onClear={() => { setSearch(""); setCurrentPage(1); }} />
      </div>
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest mb-3 text-gray-500">Category</h3>
        <ul className="space-y-1">
          {categories.map((cat) => (
            <li key={cat}>
              <motion.button onClick={() => { setCategory(cat); setCurrentPage(1); setMobileFilterOpen(false); }}
                whileTap={{ scale: 0.97 }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: category === cat ? "#000" : "transparent", color: category === cat ? "#fff" : "#6b7280" }}>
                {cat}
              </motion.button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest mb-3 text-gray-500">Price (PKR)</h3>
        <PriceFilter minPrice={0} maxPrice={150000} value={priceRange}
          onChange={(r) => { setPriceRange(r); setCurrentPage(1); }} />
      </div>
      <motion.button onClick={resetAll} whileTap={{ scale: 0.97 }}
        className="w-full py-2.5 rounded-xl border text-sm text-gray-500 hover:border-gray-400 transition">
        Reset filters
      </motion.button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div ref={headerRef} className="bg-black text-white py-12 md:py-16 px-5 md:px-8">
        <motion.div className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <p className="uppercase tracking-[0.35em] text-xs mb-2 text-white/40">Our Collection</p>
          <h1 className="text-4xl md:text-5xl font-black" style={{ fontFamily: "'Georgia', serif" }}>Shop Watches</h1>
          <p className="text-white/40 mt-1 text-sm">{total} timepieces available</p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8">
        {/* Mobile filter button */}
        <div className="flex items-center justify-between mb-5 md:hidden">
          <motion.button onClick={() => setMobileFilterOpen(true)} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium">
            <FaSlidersH /> Filters
          </motion.button>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
            className="text-sm border rounded-xl px-3 py-2 outline-none bg-white text-gray-700">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {mobileFilterOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMobileFilterOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
              <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 p-6 overflow-y-auto md:hidden">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-black text-lg">Filters</h2>
                  <motion.button onClick={() => setMobileFilterOpen(false)} whileTap={{ scale: 0.9 }}>
                    <FaTimes className="text-gray-500" />
                  </motion.button>
                </div>
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-4 gap-8">
          <aside className="hidden md:block md:col-span-1">
            <div className="sticky top-24"><SidebarContent /></div>
          </aside>

          <div className="md:col-span-3">
            <div className="hidden md:flex items-center justify-between mb-6">
              <p className="text-sm text-gray-400">
                Showing <span className="font-semibold text-black">{products.length}</span> of{" "}
                <span className="font-semibold text-black">{total}</span> results
              </p>
              <select value={sort} onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
                className="text-sm border rounded-xl px-4 py-2 outline-none bg-white text-gray-700">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {loading ? (
              <Loader />
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-4">🕐</p>
                <p className="font-semibold text-lg">No watches found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
                className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map((product, i) => (
                  <motion.div key={product.id}
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                    <ProductCard
                      id={product.id}
                      image={product.image}
                      name={product.name}
                      price={product.price}
                      originalPrice={product.original_price}
                      rating={product.rating}
                      reviews={product.num_reviews}
                      category={product.category}
                      badge={product.badge}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(total / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
