import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SlotReel({ items, finalValue, spinTime = 2000, cursed, spinning: parentSpinning }) {
  const [displayValue, setDisplayValue] = useState(finalValue || "???");
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (!parentSpinning) return;

    setSpinning(true);
    setDisplayValue(items[0]); // start at first item

    const interval = setInterval(() => {
      setDisplayValue(items[Math.floor(Math.random() * items.length)]);
    }, 50);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setDisplayValue(finalValue); // set final value immediately
      setSpinning(false); // stop visual animation
    }, spinTime);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [parentSpinning, finalValue, items, spinTime]);

  // Shake if cursed
  const shake = !spinning && cursed
    ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } }
    : { x: 0 };

  // Only animate while spinning
  const spinMotion = spinning
    ? { y: [0, -5, 5, 0], transition: { repeat: Infinity, duration: 0.1, ease: "linear" } }
    : { y: 0 };

  // Bounce when stopped
  const bounce = !spinning
    ? { y: [-10, 0], transition: { type: "spring", stiffness: 500, damping: 10 } }
    : {};

  return (
    <motion.div
      style={{
        height: "120px",
        width: "180px",
        background: "#222",
        border: "3px solid #ff7518",
        borderRadius: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
      animate={shake}
    >
      <motion.div
        animate={{ ...spinMotion, ...bounce }}
        style={{
          fontSize: "1.5rem",
          color: "white",
          minWidth: "80px",
          textAlign: "center",
        }}
      >
        {displayValue}
      </motion.div>
    </motion.div>
  );
}
