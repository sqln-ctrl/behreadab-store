import { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
const useHeroConfig = () => {
  const [config,  setConfig]  = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminAPI.getHeroConfig().then(({ data }) => setConfig(data)).catch(console.error).finally(() => setLoading(false)); }, []);
  return { config, loading };
};
export default useHeroConfig;
