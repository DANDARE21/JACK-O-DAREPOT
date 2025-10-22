import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Howl } from "howler";

export default function SlotReel({
  items,
  finalValue,
  spinTime = 2000,
  cursed,
  spinning: parentSpinning,
  pitch = 1.0, // ✅ add pitch prop
}) {
  const [displayValue, setDisplayValue] = useState(finalValue || "?");
  const [spinning, setSpinning] = useState(false);
  const stopSound = useRef(null);

  const fixAssetPath = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return path;
    return `/assets/${path}`;
  };

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
      volume: 1,
      rate: pitch, // <-- use pitch here
    });
  }, [items, pitch]);

  useEffect(() => {
    if (!parentSpinning) return;

    setSpinning(true);

    const sixItem = { name: "6", image: "/assets/images/six.png" };
    const spinningItems = cursed ? [...items, sixItem] : [...items];

    const interval = setInterval(() => {
      const randomItem =
        spinningItems[Math.floor(Math.random() * spinningItems.length)];
      setDisplayValue(randomItem);
    }, 80);

    const timeout = setTimeout(() => {
      clearInterval(interval);

      let finalResult = finalValue;
      if (cursed && finalValue === "6") {
        finalResult = {
          name: "6",
          image: "/assets/images/six.png",
          sound: "/assets/sounds/six-final.mp3",
        };
      }

      setDisplayValue(finalResult);
      setSpinning(false);

      // ✅ Play stop sound with individual pitch
      stopSound.current?.rate(pitch);
      stopSound.current?.play();

      // ✅ Play final sound (like the cursed 6)
      if (finalResult?.sound) {
        const finalSound = new Howl({
          src: [fixAssetPath(finalResult.sound)],
          volume: 1,
        });
        finalSound.play();
      }
    }, spinTime);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [parentSpinning, finalValue, items, spinTime, cursed, pitch]);

  // Animations
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
