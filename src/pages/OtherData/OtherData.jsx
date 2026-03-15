import React, { useEffect, useState } from "react";
import "./OtherData.css";
import Layout from "../../components/Layout/Layout";
import ApacheGraph from "../../components/ApacheGraph/ApacheGraph";
import apacheGraphConfig from "../../config/apacheGraphConfig.json";

const OtherData = () => {
  // Si necesitas cargar el JSON desde un endpoint, usa fetch. Aquí se importa directamente.
  return (
    <div className="other-data-container">
      <div className="apache-graphs-grid">
        {apacheGraphConfig.map((config, idx) => (
          <div className="apache-graph-card" key={idx}>
            <ApacheGraph
              tituloKey={config.tituloKey}
              variables={config.variables.map((v) => v.nombre)}
              unidades={config.variables.map((v) => v.unidad)}
              apiKeys={config.variables.map((v) => v.api_key)}
              tablas={config.variables.map((v) => v.tabla)}
              variablesApi={config.variables.map((v) => v.variable)}
              defaultStartDaysAgo={config.defaultStartDaysAgo ?? 0}
              stacked={config.stacked ?? false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OtherData;
