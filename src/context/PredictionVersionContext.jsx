import React, { createContext, useState, useContext } from "react";

const PredictionVersionContext = createContext();

export function PredictionVersionProvider({ children }) {
  const [predictionVersion, setPredictionVersion] = useState("V1");

  return (
    <PredictionVersionContext.Provider
      value={{ predictionVersion, setPredictionVersion }}
    >
      {children}
    </PredictionVersionContext.Provider>
  );
}

export function usePredictionVersion() {
  const context = useContext(PredictionVersionContext);
  if (!context) {
    throw new Error(
      "usePredictionVersion must be used within PredictionVersionProvider",
    );
  }
  return context;
}
