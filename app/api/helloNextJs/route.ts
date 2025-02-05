import { NextResponse } from "next/server";
import {cookies} from 'next/headers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const codeVerifier = localStorage.getItem("code_verifier");
  const redirectUri = "http://localhost:3000/api/auth/callback/spotify";


  if (!clientId || !clientSecret || !codeVerifier) {
    return NextResponse.json({ error: "Missing required environment variables" }, { status: 500 });
  }
  try {
    // Forward the authorization code to your FastAPI backend
    const backendResponse = await fetch(`http://localhost:8000/api/auth/callback/spotify?code=${code}`, {
      method: 'GET',
    });

    if (!backendResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await backendResponse.json();

    if (data.access_token) {
      // Store the access token in an HTTP-only cookie
      cookies().set('spotify_access_token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600 // 1 hour
      });

      // Redirect to the frontend
      return NextResponse.redirect(new URL('/', request.url));
    } else {
      return NextResponse.json({ error: "Failed to retrieve access token" }, { status: 500 });
    }
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
