from fastapi import FastAPI, Depends, HTTPException
import spotipy
import requests
from spotipy.oauth2 import SpotifyOAuth

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}



# Spotify OAuth setup
oauth = SpotifyOAuth(
    client_id="your_client_id",
    client_secret="your_client_secret",
    redirect_uri="http://localhost:3000/api/auth/callback/spotify",
    scope="user-read-private user-read-email"
)


@app.post("/recommend-tracks")
async def recommend_tracks(audio_features: dict):
    access_token = "YOUR_SPOTIFY_ACCESS_TOKEN"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    params = {
        "seed_genres": "electronic",
        "target_energy": audio_features.get("target_energy"),
        "target_danceability": audio_features.get("target_danceability"),
        "target_loudness": audio_features.get("target_loudness"),
        "limit": 5
    }
    response = requests.get("https://api.spotify.com/v1/recommendations", headers=headers, params=params)

    if response.status_code == 200:
        tracks = response.json().get("tracks", [])
        return {"tracks": [{"uri": track["uri"], "name": track["name"]} for track in tracks]}
    else:
        raise HTTPException(status_code=response.status_code, detail="Error fetching recommendations")

#@app.post("/api/py/recommend-tracks")
#def recommend_tracks(params: dict):
#    try:
#        sp = spotipy.Spotify(auth=params.get("access_token"))
 #       recommendations = sp.recommendations(
 #           seed_genres=["pop", "hip hop", "edm","jazz","rock","rnb","soul","kpop","reggae","jazz fusion","indie pop","jungle dnb","rapper","Latin American"]  # Default genres (can be customized)
 #           limit=10,
 #           target_energy=params.get("target_energy"),
 #           target_danceability=params.get("target_danceability"),
 #       )
 #       return {"tracks": recommendations["tracks"]}
  #  except Exception as e:
   #     raise HTTPException(status_code=500, detail=str(e))
