export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

export const TRAINING_STEPS = [
  {
    id: 1,
    title: "Multi-Source Intelligence",
    subtitle: "Integración de datos climáticos, energéticos y de mercado para fundamentar predicciones precisas.",
    image: "/cuadro_1.png",
    architecture: "Este submodelo utiliza 10 nodos climáticos de España, precios históricos de gas y CO2, y datos de mercado para crear un vector de características multidimensional. Emplea técnicas de procesamiento de señales y aprendizaje automático para filtrar ruido y detectar patrones estacionales.",
    optimization: "Proporciona inputs precisos que permiten al sistema BESS anticipar fluctuaciones en la oferta y demanda, maximizando el ROI al cargar/descargar en momentos óptimos."
  },
  {
    id: 2,
    title: "Consumption Forecasting",
    subtitle: "Predicción horaria de demanda residencial e industrial mediante IA avanzada.",
    image: "/cuadro_2.png",
    architecture: "Utiliza redes neuronales recurrentes (LSTM) entrenadas con datos históricos de consumo, ajustadas por factores socioeconómicos y climáticos. Incluye modelos de regresión para pronosticar picos de demanda.",
    optimization: "Permite al BESS almacenar energía durante periodos de baja demanda y liberarla en picos, reduciendo costos operativos y aumentando la eficiencia energética."
  },
  {
    id: 3,
    title: "Renewable & Market Synthesis",
    subtitle: "Conversión de datos climáticos en predicciones de generación renovable y precios del pool.",
    image: "/cuadro_3.png",
    architecture: "Combina modelos meteorológicos con algoritmos de machine learning para convertir pronósticos climáticos en MWh generados. Integra datos de mercado para predecir el precio marginal del pool mediante análisis de series temporales.",
    optimization: "Facilita la sincronización de carga/descarga con la generación renovable variable, optimizando el arbitraje en el mercado y maximizando ganancias."
  },
  {
    id: 4,
    title: "BESS Strategy & Optimization",
    subtitle: "Cálculo óptimo de ciclos de carga/descarga para maximizar ROI de la batería.",
    image: "/cuadro_4.png",
    architecture: "Emplea algoritmos de optimización (programación lineal, heurísticas genéticas) para calcular ciclos basados en predicciones de precios, demanda y generación. Incluye modelado de degradación de batería.",
    optimization: "Directamente impacta la rentabilidad al determinar estrategias que minimizan costos y maximizan ingresos, considerando restricciones físicas de la batería."
  }
];
