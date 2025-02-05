import "./globals.css";
import { Inter } from "next/font/google";
import { SpotifyPlayerProvider } from "./context/SpotifyPlayerContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "COLORIFY",
  description: "Color-based music discovery",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SpotifyPlayerProvider>
          {children}
        </SpotifyPlayerProvider>
      </body>
    </html>
  );
}