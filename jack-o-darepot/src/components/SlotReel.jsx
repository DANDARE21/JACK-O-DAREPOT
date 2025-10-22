import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Howl } from "howler";

export default function SlotReel({
  items,
  finalValue,
  spinTime = 2000,
  cursed,
  spinning: parentSpinning,
}) {
  const [displayValue, setDisplayValue] = useState(finalValue || "?");
  const [spinning, setSpinning] = useState(false);
  const stopSound = useRef(null);

  useEffect(() => {
    // ✅ Preload all valid images
    items.forEach((item) => {
      if (item?.image) {
        const img = new Image();
        img.src = fixAssetPath(item.image);
      }
    });

    // ✅ Load reel stop sound
    stopSound.current = new Howl({
      src: ["/assets/sounds/reel-stop.mp3"],
      volume: 0.5,
    });
  }, [items]);

  useEffect(() => {
    if (!parentSpinning) return;

    setSpinning(true);

    const interval = setInterval(() => {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      setDisplayValue(randomItem);
    }, 80);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setDisplayValue(finalValue);
      setSpinning(false);

      console.log("🎵 Reel stopped at:", finalValue.name || finalValue);

      stopSound.current?.play();

      if (finalValue?.sound) {
        const itemSound = new Howl({
          src: [fixAssetPath(finalValue.sound)],
          volume: 0.8,
        });
        itemSound.play();
      }
    }, spinTime);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [parentSpinning, finalValue, items, spinTime]);

  const fixAssetPath = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return path;
    return `/assets/${path}`;
  };

  const shake = !spinning && cursed
    ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } }
    : { x: 0 };

  const spinMotion = spinning
    ? { y: [0, -5, 5, 0], transition: { repeat: Infinity, duration: 0.1, ease: "linear" } }
    : { y: 0 };

  const bounce = !spinning
    ? { y: [-10, 0], transition: { type: "spring", stiffness: 500, damping: 10 } }
    : {};

  const isImage = displayValue && displayValue.image;

  // ✅ Motion blur only on the inner content
  //const blurAmount = spinning ? 0.1 : 0;

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
          fontSize: "1.3rem",
          color: "white",
          minWidth: "150px",
          textAlign: "center",
          //filter: `blur(${blurAmount}px)`,
          transition: "filter 0.2s ease",
          willChange: "transform, filter",
        }}
      >
        {isImage ? (
          <img
            src={fixAssetPath(displayValue.image)}
            alt={displayValue.name || "Image"}
            style={{
              maxHeight: "100px",
              maxWidth: "160px",
              objectFit: "contain",
              //filter: `blur(${blurAmount}px)`,
              transition: "filter 0.2s ease",
            }}
          />
        ) : (
          displayValue.name || displayValue
        )}
      </motion.div>
    </motion.div>
  );
}
