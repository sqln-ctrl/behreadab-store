import { useState, useEffect } from "react";
import { settingsAPI } from "../services/api";
const DEFAULTS = { delivery_charge: 500, free_delivery_threshold: 5000, return_days: 30, warranty_months: 24 };
const useSettings = () => {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading,  setLoading]  = useState(true);
  useEffect(() => { settingsAPI.get().then(({ data }) => setSettings({ ...DEFAULTS, ...data })).catch(console.error).finally(() => setLoading(false)); }, []);
  return { settings, loading };
};
export default useSettings;
