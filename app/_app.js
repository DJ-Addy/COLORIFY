import { useEffect } from "react";
import { SpotifyPlayerProvider } from "../context/SpotifyPlayerContext";

export default function App({ Component, pageProps }) {
  return (
    <SpotifyPlayerProvider>
      <Component {...pageProps} />
    </SpotifyPlayerProvider>
  );
}