"use client";
import React, { Suspense,useRef, useMemo,useState,useEffect } from "react"
import * as THREE from "three"
import { Canvas,extend ,useFrame,useThree } from "@react-three/fiber"
import { Clouds, Cloud, Sky as SkyImpl, OrbitControls, StatsGl,Sparkles,Shadow,Billboard, FaceControls, shaderMaterial, } from "@react-three/drei"
import { Leva,useControls } from "leva";
import { LayerMaterial, Depth } from 'lamina'
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import Grass from "./Grass"
import VisualizerBars from "./SoundWave";
import stc from "string-to-color";




export default function App() {
  const [clearScene, setClearScene] = useState(false);
  const [sphereColor, setSphereColor] = useState("#FFFFFF"); 
  const [glowColor, setGlowColor] = useState("#FFFFFF");// Default color
  const [inputValue, setInputValue] = useState(""); // Input value from the search bar
  //const audioData = useAudioData();
  const playTrack = (trackUri) => {
    const player = new Spotify.Player({
      name: "COLORIFY Player",
      getOAuthToken: (cb) => cb(localStorage.getItem("access_token")),
    });
  
    player.connect().then(() => {
      player.play({
        context_uri: trackUri,
      });
    });
  };
  // Automatically play a song when the component mounts
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      // Replace with a valid Spotify track URI
      const trackUri = "spotify:track:4cOdK2wGLETKBW3PvgPWqT"; // Example track
      playTrack(trackUri);
    }
  }, []);
  
  
  // Handle color changes from the color picker
  const handleColorChange = async(e) => {
    const newColor = e.target.value; // Get the selected color
    setSphereColor(newColor); // Update the sphere color
    // Get color properties
    const { intensity, hue, saturation } = getColorProperties(newColor);

    // Map properties to Spotify parameters
    const spotifyParams = {
      target_energy: intensity, // Intensity → Energy
      target_danceability: hue / 360, // Hue → Danceability (normalized to [0, 1])
      target_loudness: saturation * 10, // Saturation → Loudness (scaled)
    };

    // Send data to backend
    const response = await fetch("/api/py/recommend-tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(spotifyParams),
  });

  const data = await response.json();
  console.log("Recommended Tracks:", data.tracks);

  // Play the first recommended track
  if (data.tracks && data.tracks.length > 0) {
    playTrack(data.tracks[0].uri); // Pass the URI of the first track
  }
  };

  // Handle input changes from the search bar
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Check if the input is a valid hex color code
    const newColor=stc(value);
    setGlowColor(newColor);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const newColor = stc(inputValue);
      setSphereColor(newColor);
    }
  };
  

  return (
    <div style={{ position: 'relative', width: '160vw', height: '100vh' }}>
      {/* Search Bar and Color Picker */}
      <div
        className="Search"
        style={{
          position: "absolute",
          top: 10,
          left: "38%",
          zIndex: 1,
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          className="searchInput"
          type="text"
          placeholder="Enter hex code or text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          
        />
        <input
          type="color"
          value={sphereColor}
          onChange={handleColorChange}
          style={{ padding: "5px", borderRadius: "4px" }}
        />
      </div>
      <Leva collapsed /> 
      {/*prevx:-53.486213209665124*/}
      <Canvas camera={{ position: [-53.486213209665124, 17.192457225934046, -34.30388762911783], fov: 75 }}>
        <hemisphereLight intensity={0.5} color="white" groundColor="black" />
        {!clearScene && <SceneContents sphereColor={sphereColor} glowColor={glowColor} />}
      </Canvas>
      
      {/* HTML elements outside Canvas */}
      <button 
        onClick={() => setClearScene(true)} 
        style={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}
      >
        Clear Scene
      </button>
    </div>
  );
}

function SceneContents({sphereColor,glowColor}) {
  const { scene,} = useThree();
  /*const { playTrack } = useSpotify();*/
  const {  emissiveColor, glowColor:levaGlow } = useControls({
    emissiveColor: '#ffffff',
    glowColor: '#ffffff'
  });
  // Cleanup function
  useEffect(() => {
    return () => {
      scene.traverse(obj => {
        if (obj.isMesh) {
          obj.geometry?.dispose();
          obj.material?.dispose();
        }
        if (obj.isTexture) obj.dispose();
        if (obj.isLight) obj.dispose();
      });
      
      while(scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
    };
  }, [scene]);

  
    /*<VisualizerBars audioData={audioData}/>*/
  return (
    <>
    {/* Post-Processing Effects */}
    <EffectComposer>
        <Bloom
          intensity={0.6} // Strength of the bloom effect
          luminanceThreshold={0.1} // Brightness threshold for glow
          luminanceSmoothing={0.9} // Smoothness of the glow
          height={300} // Resolution of the effect
        />
      </EffectComposer>
      <SkyWithClouds />
      <ambientLight intensity={Math.PI / 1.5} />
      <Suspense fallback={null}>
      <Sphere 
          color={sphereColor} 
          glow={glowColor} 
          amount={200} 
          position={[10, 10, 10]} 
        />
        <Grass />
      </Suspense>
      <OrbitControls minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2.5}  />
    </>
  );
}


const Sphere = ({ size = 10, amount = 50, color, emissive, glow, ...props }) => (
  <mesh {...props}>
    <sphereGeometry args={[size, 64, 64]} />
    <meshPhysicalMaterial roughness={0} color={color} emissive={emissive || color} envMapIntensity={0.2} />
    <Glow scale={size * 1.2} near={-25} color={glow || emissive || color} />
    <Sparkles count={amount} scale={size * 2} size={16} speed={2} />
    {/*<Shadow rotation={[-Math.PI / 2, 0, 0]} scale={size * 1.5} position={[0, -size, 0]} color="black" opacity={1} />*/}
  </mesh>
);

  const Glow = ({ color, scale = 0.5, near = -2, far = 1.4 }) => (
    <Billboard>
      <mesh>
        <circleGeometry args={[2 * scale, 16]} />
        <LayerMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          blendEquation={THREE.AddEquation}
          blendSrc={THREE.SrcAlphaFactor}
          blendDst={THREE.DstAlphaFactor}>
          <Depth colorA={color} colorB="black" alpha={1} mode="normal" near={near * scale} far={far * scale} origin={[0, 0, 0]} />
          <Depth colorA={color} colorB="black" alpha={0.5} mode="add" near={-40 * scale} far={far * 1.2 * scale} origin={[0, 0, 0]} />
          <Depth colorA={color} colorB="black" alpha={1} mode="add" near={-15 * scale} far={far * 0.7 * scale} origin={[0, 0, 0]} />
          <Depth colorA={color} colorB="black" alpha={1} mode="add" near={-10 * scale} far={far * 0.68 * scale} origin={[0, 0, 0]} />
        </LayerMaterial>
      </mesh>
    </Billboard>
  )

  function useAudioData() {
    const [audioData, setAudioData] = useState([]);

    useEffect(() => {
      const interval = setInterval(() => {
        // Generate random audio data (e.g., 32 bars)
        const newData = Array.from({ length: 32 }, () => Math.random());
        setAudioData(newData);
      }, 100);

      return () => clearInterval(interval);
    }, []);

    return audioData;
  }

function getColorProperties(hex) {
    // Remove the '#' if present
    hex = hex.replace("#", "");
  
    // Parse RGB values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
  
    // Calculate intensity
    const intensity = (r + g + b) / 3;
  
    // Convert RGB to HSL
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
  
    let h = 0,
      s = 0,
      l = (max + min) / 2;
  
    if (delta !== 0) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  
      switch (max) {
        case r:
          h = (g - b) / delta + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / delta + 2;
          break;
        case b:
          h = (r - g) / delta + 4;
          break;
      }
  
      h *= 60;
    }
  
    return {
      intensity: intensity / 255, // Normalize to [0, 1]
      hue: h,
      saturation: s,
      lightness: l,
    };
}

function SkyWithClouds() {
  const ref = useRef();
  const cloud0 = useRef();

  const { color, x, y, z, range, ...config } = useControls({
    range: { value: 100, min: 0, max: 1000, step: 1 },
    seed: { value: 1, min: 1, max: 100, step: 1 },
    segments: { value: 20, min: 1, max: 80, step: 1 },
    volume: { value: 6, min: 0, max: 100, step: 0.1 },
    opacity: { value: 0.8, min: 0, max: 1, step: 0.01 },
    fade: { value: 10, min: 0, max: 400, step: 1 },
    growth: { value: 4, min: 0, max: 20, step: 1 },
    speed: { value: 0.1, min: 0, max: 1, step: 0.01 },
    x: { value: 100, min: 0, max: 100, step: 1 },
    y: { value: 1, min: 0, max: 100, step: 1 },
    z: { value: 100, min: 0, max: 100, step: 1 },
    color: "white",
  });

  useFrame((state, delta) => {
    ref.current.rotation.y = Math.cos(state.clock.elapsedTime / 2) / 2;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime / 2) / 2;
    cloud0.current.rotation.y -= delta;
  });

  return (
    <>
      <SkyImpl azimuth={1} inclination={0.6} distance={1000} />
      <group ref={ref}>
        <Clouds material={THREE.MeshLambertMaterial} limit={400} range={range}>
          <Cloud ref={cloud0} {...config} bounds={[x, y, z]} color={color} />
          <Cloud {...config} bounds={[x, y, z]} color="#eed0d0" seed={2} position={[15, 70, 0]} />
          <Cloud {...config} bounds={[x, y, z]} color="#d0e0d0" seed={3} position={[-15, 70, 0]} />
          <Cloud {...config} bounds={[x, y, z]} color="#a0b0d0" seed={4} position={[0, 70, -12]} />
          <Cloud {...config} bounds={[x, y, z]} color="#c0c0dd" seed={5} position={[0, 70, 12]} />
          <Cloud
            concentrate="outside"
            growth={100}
            color="#ffccdd"
            opacity={1.25}
            seed={0.3}
            bounds={[200,200,200]}
            volume={200}
          />
        </Clouds>
      </group>
    </>
  );
}


