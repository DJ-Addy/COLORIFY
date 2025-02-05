from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import spotipy
from spotipy.oauth2 import SpotifyOAuth

app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Spotify OAuth setup (use your credentials)
oauth = SpotifyOAuth(
    client_id="your_client_id",
    client_secret="your_client_secret",
    redirect_uri="http://localhost:3000/api/auth/callback/spotify",
    scope="user-read-private user-read-email"
)

@app.get("/api/auth/callback/spotify")
async def spotify_callback(code: str):
    try:
        token_info = oauth.get_access_token(code)
        access_token = token_info.get('access_token')
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to retrieve access token")
        return {"access_token": access_token}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/py/recommend-tracks")
async def recommend_tracks(request: Request):
    try:
        audio_features = await request.json()
        
        # Get the access token from the Authorization header
        auth_header = request.headers.get("Authorization", "")
        access_token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else None

        if not access_token:
            raise HTTPException(status_code=401, detail="No access token provided")

        # Initialize the Spotipy client
        sp = spotipy.Spotify(auth=access_token)

        # Extract target parameters from the payload
        target_energy = audio_features.get("target_energy")
        target_danceability = audio_features.get("target_danceability")
        target_loudness = audio_features.get("target_loudness")
        

        recommendations = sp.recommendations(
            seed_genres=["electronic"],
            limit=1,
            target_energy=target_energy,
            target_danceability=target_danceability,
            target_loudness=target_loudness
        )
        
        tracks = recommendations.get("tracks", [])
        return {"tracks": [{"uri": track["uri"], "name": track["name"]} for track in tracks]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
