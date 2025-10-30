import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import SlotReel from "./SlotReel";
import { motion } from "framer-motion";
import { Howl } from "howler";
import "./SlotMachine.css";

const CursedSlotMachine = forwardRef(
  ({ players, gamesByCategory, challenges, messages, spinning }, ref) => {
    const [player, setPlayer] = useState("?");
    const [game, setGame] = useState("?");
    const [challengeName, setChallengeName] = useState("?");
    const [challengeText, setChallengeText] = useState("?");
    const [displayText, setDisplayText] = useState("");
    const [preloadedImages, setPreloadedImages] = useState([]);

    const allGames = Object.values(gamesByCategory).flat();
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // ✅ Preload game images
    useEffect(() => {
      const imgs = [];
      Object.values(gamesByCategory).forEach((category) => {
        category.forEach((game) => {
          if (game.image) {
            const img = new Image();
            img.src = game.image;
            imgs.push(img);
          }
        });
      });
      setPreloadedImages(imgs);
    }, [gamesByCategory]);

    // ✅ Spin sound
    const cursedSpinSound = new Howl({
      src: ["/assets/sounds/cursed_spin.mp3"],
      volume: 0.9,
    });

    useImperativeHandle(ref, () => ({
      spin(onComplete) {
        if (!players.length || !allGames.length || !challenges.length) return;

        console.log("[CursedSlotMachine] Starting cursed spin...");
        cursedSpinSound.play();
        setDisplayText(getRandom(messages));

        const selectedPlayer = getRandom(players);
        const selectedGame = getRandom(allGames);
        const selectedChallenge = getRandom(challenges);

        console.log("[CursedSlotMachine] Selected player:", selectedPlayer);
        console.log("[CursedSlotMachine] Selected game:", selectedGame);
        console.log("[CursedSlotMachine] Selected challenge:", selectedChallenge);

        // Update reels
        setPlayer(selectedPlayer.name || selectedPlayer);
        setGame(selectedGame.name || selectedGame);
        setChallengeName(selectedChallenge.name || "???");
        setChallengeText(selectedChallenge.text || "???");

        // 🕒 Wait for reels to finish
        setTimeout(() => {
          console.log("[CursedSlotMachine] Spin complete.");
          const result = {
            player: selectedPlayer,
            game: selectedGame,
            challengeName: selectedChallenge.name,
            challengeText: selectedChallenge.text,
          };

          console.log("[CursedSlotMachine] Finished spin with:", result);
          if (onComplete) onComplete(result);
        }, 8100);
      },
    }));

    // ✅ Random spinning image for visual feedback
    const getRandomImage = () => {
      if (!preloadedImages.length) return null;
      const randomIndex = Math.floor(Math.random() * preloadedImages.length);
      return preloadedImages[randomIndex].src;
    };

    return (
      <div className="slot-machine-background cursed">
        <div className="slot-machine-container" style={{ position: "relative" }}>
          <motion.div
            className="slot-textbox"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {displayText || "The machine whispers..."}
          </motion.div>

          <div className="slots-wrapper">
            <SlotReel
              items={players.map((p) => p.name || p)}
              finalValue={player}
              spinTime={4000}
              spinning={spinning}
              cursed={true}
              pitch={1}
            />

            <SlotReel
              items={allGames.map((g) => ({
                name: g.name,
                image: g.image || null,
              }))}
              finalValue={game}
              spinTime={6000}
              spinning={spinning}
              cursed={true}
              pitch={1.15}
              getRandomImage={getRandomImage}
            />

            <SlotReel
              items={challenges.map((c) => c.name || "Unknown Challenge")}
              finalValue={challengeName}
              spinTime={8000}
              spinning={spinning}
              cursed={true}
              pitch={1.3}
            />
          </div>
        </div>
      </div>
    );
  }
);

export default CursedSlotMachine;
