import { useState, useEffect } from "react";
import { productsAPI } from "../services/api";
const useProducts = (params = {}) => {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  useEffect(() => {
    setLoading(true);
    productsAPI.getAll(params).then(({ data }) => { setProducts(data.products || []); setTotal(data.total || 0); }).catch(console.error).finally(() => setLoading(false));
  }, [JSON.stringify(params)]);
  return { products, loading, total };
};
export default useProducts;
