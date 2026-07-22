import { FaSearch, FaTimes } from "react-icons/fa";
const SearchBar = ({ value, onChange, onClear, placeholder = "Search..." }) => (
  <div className="relative">
    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full pl-9 pr-8 py-2.5 border rounded-xl text-sm outline-none focus:border-black transition bg-white" />
    {value && <button onClick={onClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"><FaTimes className="text-xs" /></button>}
  </div>
);
export default SearchBar;
