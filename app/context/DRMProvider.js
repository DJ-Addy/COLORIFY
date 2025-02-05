// DRMProvider.js
"use client";
import { createContext, useState, useEffect } from "react";

export const DRMContext = createContext();

export const DRMProvider = ({ children }) => {
  const [drmSupported, setDrmSupported] = useState(false);

  const drmConfig = [
    {
      initDataTypes: ["cenc"],
      audioCapabilities: [
        {
          contentType: 'audio/mp4;codecs="mp4a.40.2"',
          robustness: "SW_SECURE_CRYPTO",
        },
      ],
    },
  ];

  useEffect(() => {
    navigator
      .requestMediaKeySystemAccess("com.widevine.alpha", drmConfig)
      .then(() => setDrmSupported(true))
      .catch(() => setDrmSupported(false));
  }, []);

  return (
    <DRMContext.Provider value={{ drmSupported }}>
      {children}
    </DRMContext.Provider>
  );
};