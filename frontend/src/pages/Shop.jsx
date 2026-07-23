import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSlidersH, FaTimes, FaSearch, FaFire, FaStar, FaClock } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import { productsAPI } from "../services/api";
import api from "../services/api";

const SORT_OPTIONS = [
  { value: "default",    label: "Featured",         icon: <FaFire className="text-xs" /> },
  { value: "newest",     label: "Newest",           icon: <FaClock className="text-xs" /> },
  { value: "rating",     label: "Top Rated",        icon: <FaStar className="text-xs" /> },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
];

const ITEMS_PER_PAGE = 12;

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,    setProducts]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState(searchParams.get("search") || "");
  const [category,    setCategory]    = useState(searchParams.get("category") || "All");
  const [sort,        setSort]        = useState("default");
  const [priceRange,  setPriceRange]  = useState([0, 150000]);
  const [page,        setPage]        = useState(1);
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [searchInput, setSearchInput] = useState(search);
  const headerRef = useRef(null);

  const [categories, setCategories] = useState(["All"]);

  useEffect(() => {
    api.get("/categories").then(({ data }) => {
      setCategories(["All", ...data.map(c => c.name)]);
    }).catch(console.error);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: ITEMS_PER_PAGE };
      if (search)             params.search   = search;
      if (category !== "All") params.category = category;
      if (sort !== "default") params.sort     = sort;
      if (priceRange[0] > 0)  params.minPrice = priceRange[0];
      if (priceRange[1] < 150000) params.maxPrice = priceRange[1];
      const { data } = await productsAPI.getAll(params);
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [search, category, sort, priceRange, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const resetAll = () => {
    setSearch(""); setSearchInput(""); setCategory("All");
    setSort("default"); setPriceRange([0, 150000]); setPage(1);
  };

  const hasFilters = search || category !== "All" || sort !== "default" || priceRange[0] > 0 || priceRange[1] < 150000;

  const FilterPanel = ({ mobile = false }) => (
    <div className={`space-y-6 ${mobile ? "" : ""}`}>
      {/* Search */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Search</p>
        <form onSubmit={handleSearchSubmit} className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search watches..." className="w-full pl-8 pr-4 py-2.5 border rounded-xl text-sm outline-none focus:border-black transition bg-white" />
        </form>
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Category</p>
        <div className="space-y-1">
          {categories.map((cat) => (
            <motion.button key={cat} onClick={() => { setCategory(cat); setPage(1); if (mobile) setFilterOpen(false); }}
              whileTap={{ scale: 0.97 }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between"
              style={{ background: category === cat ? "#000" : "transparent", color: category === cat ? "#fff" : "#6b7280" }}>
              {cat}
              {category === cat && <span className="text-xs opacity-60">{total}</span>}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Price (PKR)</p>
          <p className="text-xs text-gray-400">{Number(priceRange[0]).toLocaleString()} — {Number(priceRange[1]).toLocaleString()}</p>
        </div>
        <div className="space-y-2">
          <input type="range" min={0} max={150000} step={1000} value={priceRange[0]}
            onChange={(e) => { setPriceRange([Number(e.target.value), priceRange[1]]); setPage(1); }}
            className="w-full accent-black" />
          <input type="range" min={0} max={150000} step={1000} value={priceRange[1]}
            onChange={(e) => { setPriceRange([priceRange[0], Number(e.target.value)]); setPage(1); }}
            className="w-full accent-black" />
        </div>
        <div className="flex gap-2 mt-3">
          {[[0,50000,"Under 50k"],[0,100000,"Under 100k"],[0,150000,"All"]].map(([min,max,label]) => (
            <motion.button key={label} onClick={() => { setPriceRange([min,max]); setPage(1); }} whileTap={{ scale:0.95 }}
              className="text-xs px-3 py-1 rounded-full border transition"
              style={{ borderColor: priceRange[0]===min && priceRange[1]===max ? "#000" : "#e5e7eb", color: priceRange[0]===min && priceRange[1]===max ? "#000" : "#9ca3af", fontWeight: priceRange[0]===min && priceRange[1]===max ? 700 : 400 }}>
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <motion.button onClick={resetAll} whileTap={{ scale:0.97 }}
          className="w-full py-2.5 rounded-xl border text-sm font-medium text-gray-500 hover:border-black transition">
          Clear all filters
        </motion.button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile-first hero banner */}
      <div className="bg-black text-white" ref={headerRef}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="uppercase tracking-[0.3em] text-xs mb-2 text-white/40">Our Collection</p>
              <h1 className="text-4xl md:text-5xl font-black leading-none" style={{ fontFamily:"'Georgia', serif" }}>
                Shop Watches
              </h1>
              <p className="text-white/40 text-sm mt-2">
                {loading ? "Loading..." : `${total} timepiece${total !== 1 ? "s" : ""} available`}
              </p>
            </div>

            {/* Sort — visible on desktop in header */}
            <div className="hidden md:flex items-center gap-2">
              {SORT_OPTIONS.slice(0,3).map((o) => (
                <motion.button key={o.value} onClick={() => { setSort(o.value); setPage(1); }} whileTap={{ scale:0.97 }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition"
                  style={{ background: sort === o.value ? "#fff" : "rgba(255,255,255,0.08)", color: sort === o.value ? "#000" : "rgba(255,255,255,0.6)" }}>
                  {o.icon} {o.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="flex gap-2 flex-wrap mt-4">
              {search && <span className="bg-white/10 text-white/80 text-xs px-3 py-1 rounded-full flex items-center gap-1.5">"{search}" <button onClick={() => { setSearch(""); setSearchInput(""); }}><FaTimes className="text-xs" /></button></span>}
              {category !== "All" && <span className="bg-white/10 text-white/80 text-xs px-3 py-1 rounded-full flex items-center gap-1.5">{category} <button onClick={() => setCategory("All")}><FaTimes className="text-xs" /></button></span>}
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-6">
        {/* Mobile toolbar */}
        <div className="flex items-center justify-between mb-5 md:hidden">
          <motion.button onClick={() => setFilterOpen(true)} whileTap={{ scale:0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium">
            <FaSlidersH className="text-xs" /> Filters {hasFilters && <span className="bg-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-black">!</span>}
          </motion.button>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="text-sm border rounded-xl px-3 py-2 outline-none bg-white">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-60 flex-shrink-0">
            <div className="sticky top-24"><FilterPanel /></div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {/* Desktop sort bar */}
            <div className="hidden md:flex items-center justify-between mb-6">
              <p className="text-sm text-gray-400">
                {loading ? "Loading..." : <><span className="font-bold text-black">{total}</span> results</>}
              </p>
              <div className="flex items-center gap-2">
                {SORT_OPTIONS.slice(3).map(o => (
                  <motion.button key={o.value} onClick={() => { setSort(o.value); setPage(1); }} whileTap={{ scale:0.97 }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition"
                    style={{ background: sort === o.value ? "#000" : "white", color: sort === o.value ? "#fff" : "#6b7280", borderColor: sort === o.value ? "#000" : "#e5e7eb" }}>
                    {o.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl bg-gray-100 animate-pulse" style={{ height: "280px" }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-24">
                <div className="text-5xl mb-4">⌚</div>
                <p className="font-bold text-xl text-gray-800">No watches found</p>
                <p className="text-gray-400 text-sm mt-1 mb-5">Try adjusting your filters</p>
                <motion.button onClick={resetAll} whileTap={{ scale:0.97 }}
                  className="px-6 py-3 rounded-xl bg-black text-white text-sm font-bold">
                  Clear Filters
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key={`${category}-${search}-${sort}-${page}`}
                initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.25 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {products.map((product, i) => (
                  <motion.div key={product.id}
                    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay: i * 0.05, duration:0.4, ease:[0.22,1,0.36,1] }}>
                    <ProductCard
                      id={product.id} image={product.image} name={product.name}
                      price={product.price} originalPrice={product.original_price}
                      rating={product.rating} reviews={product.num_reviews}
                      category={product.category} badge={product.badge}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <Pagination currentPage={page} totalPages={Math.ceil(total / ITEMS_PER_PAGE)} onPageChange={setPage} />
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setFilterOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" />
            <motion.div initial={{ x:"-100%" }} animate={{ x:0 }} exit={{ x:"-100%" }}
              transition={{ type:"spring", stiffness:320, damping:32 }}
              className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 flex flex-col md:hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h2 className="font-black text-lg">Filters</h2>
                <motion.button onClick={() => setFilterOpen(false)} whileTap={{ scale:0.9 }}>
                  <FaTimes className="text-gray-500" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <FilterPanel mobile />
              </div>
              <div className="p-5 border-t">
                <motion.button onClick={() => setFilterOpen(false)} whileTap={{ scale:0.97 }}
                  className="w-full py-3 rounded-xl bg-black text-white font-bold text-sm">
                  Show {total} Results
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
