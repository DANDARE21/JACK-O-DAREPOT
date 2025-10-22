import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CursedText({ trigger }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger) {
      setVisible(true);

      const timer = setTimeout(() => setVisible(false), 2000); // disappear after 2s
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cursed-text"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1.2 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "red",
            fontSize: "5rem",
            fontWeight: "bold",
            textShadow: "0 0 10px red, 0 0 20px red",
            pointerEvents: "none", // so it doesn't block clicks
            zIndex: 999,
          }}
        >
          CURSED!
        </motion.div>
      )}
    </AnimatePresence>
  );
}
