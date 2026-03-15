import React, { Suspense } from "react";
import { createHashRouter } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { RoutesValues } from "../models/RoutesValues.js";

const Home = React.lazy(() => import("../pages/Home/Home"));
const Prediction = React.lazy(() => import("../pages/Prediction/Prediction"));
const Historic = React.lazy(() => import("../pages/Historic/Historic.jsx"));
const Statistics = React.lazy(() => import("../pages/Statistics/Statistics.jsx"));
const OtherData = React.lazy(() => import("../pages/OtherData/OtherData.jsx"));

// Un fallback sencillo de carga. Puedes mejorarlo con un spinner real si tienes uno
const FallbackLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <p>Loading...</p>
  </div>
);

export const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<FallbackLoader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: RoutesValues.prediction,
        element: (
          <Suspense fallback={<FallbackLoader />}>
            <Prediction />
          </Suspense>
        ),
      },
      { 
        path: RoutesValues.historic, 
        element: (
          <Suspense fallback={<FallbackLoader />}>
            <Historic />
          </Suspense>
        ) 
      },
      { 
        path: RoutesValues.statistics, 
        element: (
          <Suspense fallback={<FallbackLoader />}>
            <Statistics />
          </Suspense>
        ) 
      },
      { 
        path: RoutesValues.otherData, 
        element: (
          <Suspense fallback={<FallbackLoader />}>
            <OtherData />
          </Suspense>
        ) 
      },
    ],
  },
]);
