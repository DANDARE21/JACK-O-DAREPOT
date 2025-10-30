import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import SlotReel from "./SlotReel";
import { Howl } from "howler";
import SpinResultPopup from "./SpinResultPopup";
import "./SlotMachine.css";

const CursedSlotMachine = forwardRef(
  ({ players, gamesByCategory, challenges, spinning }, ref) => {
    const [player, setPlayer] = useState("?");
    const [game, setGame] = useState("?");
    const [challenge, setChallenge] = useState("?");
    const [displayText, setDisplayText] = useState("THE CURSE HAS AWAKENED...");
    const [preloadedImages, setPreloadedImages] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [popupData, setPopupData] = useState({});

    const allGames = Object.values(gamesByCategory).flat();
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Preload images once
    useEffect(() => {
      if (!preloadedImages.length && allGames.length) {
        const imgs = allGames.map((g) => {
          const img = new Image();
          img.src = g.image || "";
          return img;
        });
        setPreloadedImages(imgs);
      }
    }, [allGames, preloadedImages.length]);

    const spinStartSound = new Howl({
      src: ["/assets/sounds/cursed_spin.mp3"],
      volume: 0.9,
    });
    const cursedAmbience = new Howl({
      src: ["/assets/sounds/cursed_ambience.mp3"],
      volume: 0.5,
      loop: true,
    });

    // Expose spin method
    useImperativeHandle(ref, () => ({
      spin(onComplete) {
        if (!players.length || !allGames.length || !challenges.length) return;

        // 1️⃣ Choose results first
        const finalPlayer = getRandom(players);
        const finalGame = getRandom(allGames);
        const finalChallenge = getRandom(challenges);

        // Store final values so parent can access
        ref.current.finalPlayer = finalPlayer;
        ref.current.finalGame = finalGame;
        ref.current.finalChallenge = finalChallenge;

        const is666Spin =
          finalPlayer === "6" || finalGame.name === "6" || finalChallenge.name === "666";

        setPlayer(finalPlayer);
        setGame(finalGame.name);
        setChallenge(finalChallenge.name);
        setDisplayText("THE WHEELS TURN IN DARKNESS...");

        spinStartSound.play();
        cursedAmbience.play();

        const maxSpinTime = Math.max(4000, 6000, 8000);

        setTimeout(() => {
          cursedAmbience.stop();

          if (is666Spin) {
            setDisplayText(finalChallenge.text || "The curse has chosen.");
            if (onComplete) onComplete();
          } else {
            setPopupData({
              type: "cursed",
              player: finalPlayer,
              game: finalGame.name,
              challengeName: finalChallenge.name,
              challengeText: finalChallenge.text,
              onComplete,
            });
            setShowPopup(true);
          }
        }, maxSpinTime);
      },
    }));

    const handlePopupComplete = () => {
      setShowPopup(false);
      setDisplayText(popupData.challengeText || "The curse has chosen.");
      if (popupData.onComplete) popupData.onComplete();
    };

    const getRandomImage = () => {
      if (!preloadedImages.length) return null;
      return preloadedImages[Math.floor(Math.random() * preloadedImages.length)].src;
    };

    return (
      <div
        className="slot-machine-background"
        style={{
          background: "radial-gradient(circle at center, #1a0000, #000)",
          border: "3px solid crimson",
        }}
      >
        <div className="slot-machine-container" style={{ position: "relative" }}>
          <div className="slot-textbox" style={{ color: "crimson", textShadow: "0 0 15px red" }}>
            {displayText}
          </div>

          <div className="slots-wrapper">
            <SlotReel
              items={players}
              finalValue={player}
              spinTime={4000}
              spinning={spinning}
              cursed
              pitch={0.8}
            />
            <SlotReel
              items={allGames.map((g) => ({ name: g.name, image: g.image || null }))}
              finalValue={game}
              spinTime={6000}
              spinning={spinning}
              cursed
              pitch={0.9}
              getRandomImage={getRandomImage}
            />
            <SlotReel
              items={challenges.map((c) => c.name)}
              finalValue={challenge}
              spinTime={8000}
              spinning={spinning}
              cursed
              pitch={1}
            />
          </div>

          {showPopup && (
            <SpinResultPopup
              type={popupData.type}
              player={popupData.player}
              game={popupData.game}
              challengeName={popupData.challengeName}
              challengeText={popupData.challengeText}
              onClose={handlePopupComplete}
            />
          )}
        </div>
      </div>
    );
  }
);

export default CursedSlotMachine;
