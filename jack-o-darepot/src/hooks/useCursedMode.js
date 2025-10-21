import { useState, useEffect } from "react";

export default function useCursedMode(initialChance = 0.02, increment = 0.01) {
  const [cursedChance, setCursedChance] = useState(initialChance);
  const [isCursed, setIsCursed] = useState(false);

  // Load persisted chance from localStorage
  useEffect(() => {
    const savedChance = parseFloat(localStorage.getItem("cursedChance"));
    if (!isNaN(savedChance)) setCursedChance(savedChance);
  }, []);

  const spin = (resetCursedMode = false) => {
    const roll = Math.random();
    let cursed = false;

    if (roll < cursedChance) {
      cursed = true;
      setIsCursed(true);
      setCursedChance(resetCursedMode ? initialChance : cursedChance);
    } else {
      cursed = false;
      setIsCursed(false);
      setCursedChance((prev) => prev + increment);
    }

    // Persist chance
    localStorage.setItem("cursedChance", cursed ? (resetCursedMode ? initialChance : cursedChance) : cursedChance + increment);

    return cursed;
  };

  return { isCursed, cursedChance, spin };
}
