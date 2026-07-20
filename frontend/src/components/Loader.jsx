const Loader = ({ size = "md" }) => {
  const s = size === "sm" ? "w-5 h-5" : "w-8 h-8";
  return <div className={`${s} rounded-full border-2 border-gray-200 border-t-black animate-spin mx-auto`} />;
};
export default Loader;
