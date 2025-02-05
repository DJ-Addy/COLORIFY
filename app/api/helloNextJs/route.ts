import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const codeVerifier = localStorage.getItem("code_verifier");
  const redirectUri = "http://localhost:3000/api/auth/callback/spotify";

  const params = new URLSearchParams();
  params.append("client_id", process.env.SPOTIFY_CLIENT_ID!);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "redirectUri");
  params.append("code_verifier", codeVerifier!);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = await result.json();

  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token);
    return NextResponse.redirect("/");
  } else {
    return NextResponse.json({ error: "Failed to retrieve access token" }, { status: 500 });
  }
}
