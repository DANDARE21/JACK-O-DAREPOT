import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Howl } from "howler";

export default function SlotReel({
  items,
  finalValue,
  spinTime = 2000,
  cursed,
  spinning: parentSpinning,
  pitch = 1.0, // 👈 new prop — controls pitch
}) {
  const [displayValue, setDisplayValue] = useState(finalValue || "???");
  const [spinning, setSpinning] = useState(false);

  // Prepare sound with adjustable rate
  const reelStopSound = new Howl({
    src: ["/sounds/reel-stop.mp3"],
    volume: 0.6,
    preload: true,
  });

  useEffect(() => {
    if (!parentSpinning || !items?.length) return;

    console.log("[SlotReel] 🎰 Starting spin:", { finalValue, spinTime, pitch });
    setSpinning(true);
    setDisplayValue(items[0]);

    const interval = setInterval(() => {
      setDisplayValue(items[Math.floor(Math.random() * items.length)]);
    }, 50);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setDisplayValue(finalValue);
      setSpinning(false);

      // Play stop sound with pitch adjustment
      console.log("[SlotReel] 🛑 Stopped reel, finalValue:", finalValue);
      try {
        const id = reelStopSound.play();
        reelStopSound.rate(pitch, id); // 👈 adjust pitch per reel
        console.log(`[SlotReel] 🔊 Played stop sound with pitch ${pitch}`);
      } catch (err) {
        console.error("[SlotReel] ⚠️ Failed to play sound:", err);
      }
    }, spinTime);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [parentSpinning, finalValue, items, spinTime, pitch]);

  const shake = !spinning && cursed
    ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } }
    : { x: 0 };

  const spinMotion = spinning
    ? { y: [0, -5, 5, 0], transition: { repeat: Infinity, duration: 0.12, ease: "linear" } }
    : { y: 0 };

  const bounce = !spinning
    ? { y: [-10, 0], transition: { type: "spring", stiffness: 500, damping: 10 } }
    : {};

  return (
    <motion.div
      style={{
        height: "120px",
        width: "180px",
        background: "#aaaaaa",
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
          fontSize: "1.2rem",
          color: "black",
          minWidth: "120px",
          textAlign: "center",
          padding: "0 8px",
          wordBreak: "break-word",
        }}
      >
        {displayValue}
      </motion.div>
    </motion.div>
  );
}
