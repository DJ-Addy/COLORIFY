"use client"; // Add this line at the top of the file
import Image from "next/image";
import Link from "next/link";
import dynamic from 'next/dynamic';
import GrassClient from './grass/GrassClient';
import { Button } from "@/components/ui/button"
import { useState } from "react";





export default function Home() {

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const handleSpotifyLogin = () => {
    setIsAuthenticating(true);
    window.location.href = "/api/auth/login"; // Redirect to the API route
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
     <nav className="w-full border-b bg-black/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left side - Spotify Connect */}
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs font-mono text-white/80 hover:text-white hover:bg-white/10 border-white/20"
          onClick={handleSpotifyLogin} 
          disabled={isAuthenticating}
        >
          {isAuthenticating ? "Connecting..." : "Connect Spotify"}
        </Button>

        {/* Centered Title */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-3xl font-bold text-white pixel-font tracking-wide">
            COLORIFY
          </h1>
        </div>

        {/* Right side - Documentation */}
        <Link
          href="/docs"
          className="text-xs font-mono text-white/80 hover:text-white transition-colors"
        >
          Documentation
        </Link>
      </div>
    </nav>
      <div className="w-[100vw] h-[100vh] flex items-center justify-center bg-gray-100">
  <       GrassClient />
      </div>

    </main>
  );
}



 /* <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing FastApi API&nbsp;
          <Link href="/api/py/helloFastApi">
            <code className="font-mono font-bold">api/index.py</code>
          </Link>
        </p>
        <p className="fixed right-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing Next.js API&nbsp;
          <Link href="/api/helloNextJs">
            <code className="font-mono font-bold">app/api/helloNextJs</code>
          </Link>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
          </a>
        </div>
      </div>
      */