import { NextResponse } from "next/server";
import {cookies} from 'next/headers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const redirectUri = "http://localhost:3000/api/auth/callback/spotify";
  const codeVerifier = cookies().get("code_verifier")?.value;

  if (!codeVerifier) {
    return NextResponse.json({ error: "No code verifier found" }, { status: 400 });
  }

  const params = new URLSearchParams();
  params.append("client_id", process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectUri);
  params.append("code_verifier", codeVerifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = await result.json();

  if (data.access_token) {
    // Store the access token in a cookie
    cookies().set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hour
    });

    // Redirect to the home page
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/`);
  } else {
    return NextResponse.json({ error: "Failed to retrieve access token" }, { status: 500 });
  }
}


