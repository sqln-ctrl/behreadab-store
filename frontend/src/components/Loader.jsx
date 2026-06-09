import { motion } from "framer-motion";

const Loader = ({ fullscreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className="w-12 h-12 rounded-full border-2 border-transparent"
        style={{ borderTopColor: "#d4af37", borderRightColor: "#d4af3750" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
      <p className="text-sm uppercase tracking-widest text-gray-400">Loading...</p>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-20">{content}</div>;
};

export default Loader;
