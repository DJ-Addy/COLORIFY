"use client";
import { createContext, useState, useEffect } from "react";

export const SpotifyPlayerContext = createContext();

export const SpotifyPlayerProvider = ({ children }) => {
  const [player, setPlayer] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceId, setDeviceId] = useState(null);

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

      // Device ready
      newPlayer.addListener("ready", ({ device_id }) => {
        console.log("Player ready with device ID:", device_id);
        setDeviceId(device_id);
        setPlayer(newPlayer);
      });

      // Device offline
      newPlayer.addListener("not_ready", ({ device_id }) => {
        console.error("Device ID has gone offline:", device_id);
      });

      // State changes
      newPlayer.addListener("player_state_changed", (state) => {
        if (state) {
          setCurrentTrack(state.track_window.current_track);
          setIsPlaying(!state.paused);
        }
      });

      newPlayer.connect();
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, []);

  // Play a track based on recommendations from color
  const playTrack = async (uri) => {
    if (!deviceId) {
      console.error("No device ID available");
      return;
    }

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.error("No access token available");
        return;
      }

      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [uri],
        }),
      });
    } catch (error) {
      console.error("Error playing track:", error);
    }
  };

  // Get recommendations based on color
  const getRecommendations = async (colorFeatures) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.error("No access token available");
        return null;
      }

      const response = await fetch("/api/py/recommend-tracks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(colorFeatures),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.tracks;
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return null;
    }
  };

  // Playback controls
  const togglePlay = async () => {
    if (!player) return;
    await player.togglePlay();
  };

  const nextTrack = async () => {
    if (!player) return;
    await player.nextTrack();
  };

  const previousTrack = async () => {
    if (!player) return;
    await player.previousTrack();
  };

  return (
    <SpotifyPlayerContext.Provider value={{
      player,
      currentTrack,
      isPlaying,
      deviceId,
      playTrack,
      getRecommendations,
      togglePlay,
      nextTrack,
      previousTrack
    }}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
};