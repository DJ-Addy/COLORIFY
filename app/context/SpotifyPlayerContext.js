"use client";
import { createContext, useState, useEffect } from "react";

export const SpotifyPlayerContext = createContext();

export const SpotifyPlayerProvider = ({ children }) => {
  const [player, setPlayer] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [drmSupported, setDrmSupported] = useState(false);

  // DRM Configuration
  const drmConfig = [{
    initDataTypes: ['cenc'],
    audioCapabilities: [{
      contentType: 'audio/mp4;codecs="mp4a.40.2"',
      robustness: 'SW_SECURE_CRYPTO', // Specify robustness level
    }],
  }];

  useEffect(() => {
    // Load Spotify Web Playback SDK
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

    // Check for DRM support
    navigator.requestMediaKeySystemAccess('com.widevine.alpha', drmConfig)
      .then((mediaKeySystemAccess) => {
        console.log("MediaKeySystemAccess granted:", mediaKeySystemAccess);
        setDrmSupported(true);
      })
      .catch((error) => {
        console.error("Failed to access MediaKeySystem:", error);
        setDrmSupported(false);
      });

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
      drmSupported,
      playTrack,
      togglePlay,
      nextTrack,
      previousTrack,
    }}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
};