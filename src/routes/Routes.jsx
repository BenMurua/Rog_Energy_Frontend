import { createHashRouter } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import Home from "../pages/Home/Home";
import Prediction from "../pages/Prediction/Prediction";
import Historic from "../pages/Historic/Historic.jsx";
import Statistics from "../pages/Statistics/Statistics.jsx";
import { RoutesValues } from "../models/RoutesValues.js";

export const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: RoutesValues.prediction,
        element: <Prediction />,
      },
      { path: RoutesValues.historic, element: <Historic /> },
      { path: RoutesValues.statistics, element: <Statistics /> },
    ],
  },
]);
