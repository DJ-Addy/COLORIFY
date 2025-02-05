import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function VisualizerBars({ audioData }) {
  const barRefs = useRef([]);

  // Initialize bar references
  if (barRefs.current.length !== audioData?.length) {
    barRefs.current = Array(audioData?.length)
      .fill()
      .map((_, i) => barRefs.current[i] || React.createRef());
  }

  // Update bar heights based on audio data
  useFrame(() => {
    if (audioData && barRefs.current.length > 0) {
      audioData.forEach((value, index) => {
        const bar = barRefs.current[index].current;
        if (bar) {
          bar.scale.y = value * 2; // Scale the bar height based on audio data
        }
      });
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Render Bars */}
      {audioData &&
        audioData.map((_, index) => (
          <mesh
            key={index}
            ref={barRefs.current[index]}
            position={[index * 1.5 - audioData.length / 2, 0, 0]}
          >
            <boxGeometry args={[1, 0.1, 1]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>
        ))}
    </group>
  );
}