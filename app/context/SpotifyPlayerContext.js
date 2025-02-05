import { createContext, useState, useEffect } from "react";

export const SpotifyPlayerContext = createContext();

export const SpotifyPlayerProvider = ({ children }) => {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const newPlayer = new window.Spotify.Player({
        name: "COLORIFY Player",
        getOAuthToken: (cb) => cb(localStorage.getItem("access_token")),
      });

      newPlayer.addListener("ready", ({ device_id }) => {
        console.log("Player ready with device ID:", device_id);
      });

      newPlayer.addListener("not_ready", ({ device_id }) => {
        console.error("Device ID has gone offline:", device_id);
      });

      newPlayer.connect();
      setPlayer(newPlayer);
    };
  }, []);

  return (
    <SpotifyPlayerContext.Provider value={player}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
};