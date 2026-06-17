import { useState, useEffect } from "react";
import { productsAPI } from "../services/api";

const useProducts = (params = {}) => {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);

  const fetchProducts = async (overrideParams = {}) => {
    setLoading(true);
    try {
      const { data } = await productsAPI.getAll({ ...params, ...overrideParams });
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [JSON.stringify(params)]);

  return { products, loading, error, total, pages, refetch: fetchProducts };
};

export default useProducts;
