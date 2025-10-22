import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Howl } from "howler";

export default function SlotReel({
  items,
  finalValue,
  spinTime = 2000,
  cursed,
  spinning: parentSpinning,
  pitch = 1.0,
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

  // Normalize an item so we always have an object with at least { name, image?, sound? }
  const normalize = (it) => {
    if (!it && it !== 0) return null;
    if (typeof it === "string" || typeof it === "number") {
      return { name: String(it) };
    }
    // assume object already
    return it;
  };

  useEffect(() => {
    // Preload images for items
    items.forEach((item) => {
      const n = normalize(item);
      if (n?.image) {
        const img = new Image();
        img.src = fixAssetPath(n.image);
      }
    });

    // Prepare stop sound (one Howl per reel so we can tweak rate)
    stopSound.current = new Howl({
      src: ["/assets/sounds/reel-stop.mp3"],
      volume: 1,
      // don't set rate here permanently; we'll call rate() before play
    });
  }, [items]);

  useEffect(() => {
    if (!parentSpinning) return;

    setSpinning(true);

    // Always include the "6" item in the spinning pool (so "6" can appear during spin)
    const sixItem = { name: "6", image: "/assets/images/six.png" };

    // Build normalized items array and always add sixItem
    const normalized = items.map(normalize).filter(Boolean);
    const spinningItems = [...normalized, sixItem];

    const interval = setInterval(() => {
      const randomItem =
        spinningItems[Math.floor(Math.random() * spinningItems.length)];
      setDisplayValue(randomItem);
    }, 80);

    const timeout = setTimeout(() => {
      clearInterval(interval);

      // Determine final result (finalValue might be a primitive or an object)
      let finalResult = normalize(finalValue) || finalValue;

      // If the finalResult is the primitive "6" or name === "6" and cursed, attach image/sound
      if ((finalResult === "6" || finalResult?.name === "6") && cursed) {
        finalResult = {
          name: "6",
          image: "/assets/images/six.png",
          sound: "/assets/sounds/six-final.mp3",
        };
      }

      // If finalResult is still a primitive (string/number), normalize to object for rendering
      if (typeof finalResult === "string" || typeof finalResult === "number") {
        finalResult = { name: String(finalResult) };
      }

      setDisplayValue(finalResult);
      setSpinning(false);

      // Play stop sound with the reel's pitch
      try {
        stopSound.current?.rate && stopSound.current.rate(pitch);
      } catch (e) {
        // some Howler builds may not support rate in all environments; swallow
      }
      stopSound.current?.play();

      // Play any item-specific sound (e.g., cursed six final)
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
            alt={displayValue.name || displayValue}
            style={{
              maxHeight: "100px",
              maxWidth: "160px",
              objectFit: "contain",
              transition: "filter 0.2s ease",
            }}
          />
        ) : (
          displayValue?.name ?? displayValue
        )}
      </motion.div>
    </motion.div>
  );
}
