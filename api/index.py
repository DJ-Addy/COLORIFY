from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import spotipy
import requests
from spotipy.oauth2 import SpotifyOAuth

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
@app.get("/api/auth/callback/spotify")
async def spotify_callback(code: str):
    try:
        # Exchange the authorization code for an access token
        token_info = oauth.get_access_token(code)
        access_token = token_info['access_token']
        
        # Return the access token to the frontend
        return {"access_token": access_token}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/py/recommend-tracks")
async def recommend_tracks(audio_features: dict):
    try:
        # Get access token from request headers
        access_token = audio_features.get("access_token")
        if not access_token:
            raise HTTPException(status_code=401, detail="No access token provided")

        headers = {"Authorization": f"Bearer {access_token}"}
        params = {
            "seed_genres": "electronic",
            "target_energy": audio_features.get("target_energy"),
            "target_danceability": audio_features.get("target_danceability"),
            "target_loudness": audio_features.get("target_loudness"),
            "limit": 5,
        }
        
        response = requests.get(
            "https://api.spotify.com/v1/recommendations", 
            headers=headers, 
            params=params
        )
        
        if response.status_code == 200:
            tracks = response.json().get("tracks", [])
            return {"tracks": [{"uri": track["uri"], "name": track["name"]} for track in tracks]}
        else:
            raise HTTPException(status_code=response.status_code, detail="Error fetching recommendations")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
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
