"use client";

import React, { useEffect, useState, useRef } from "react";
import { Compass, RotateCw } from "lucide-react";

interface MapVenezuelaProps {
  selectedState: string | null;
  onSelectState: (stateName: string | null) => void;
}

export function MapVenezuela({ selectedState, onSelectState }: MapVenezuelaProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  
  // Dimensiones del SVG
  const width = 600;
  const height = 450;
  
  // Límites geográficos
  const [projectionConfig, setProjectionConfig] = useState<{
    minLon: number;
    maxLon: number;
    minLat: number;
    maxLat: number;
    scale: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  useEffect(() => {
    // Carga el GeoJSON local
    fetch("/data/venezuela.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Error cargando mapa");
        return res.json();
      })
      .then((data) => {
        setGeoData(data);
        calculateBounds(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const calculateBounds = (geojson: any) => {
    let minLon = Infinity, maxLon = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;

    geojson.features.forEach((feature: any) => {
      const coords = feature.geometry.coordinates;
      
      const processCoords = (arr: any) => {
        if (typeof arr[0] === "number" && typeof arr[1] === "number") {
          const [lon, lat] = arr;
          if (lon < minLon) minLon = lon;
          if (lon > maxLon) maxLon = lon;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        } else if (Array.isArray(arr)) {
          arr.forEach(processCoords);
        }
      };

      processCoords(coords);
    });

    const padding = 20;
    const mapWidth = maxLon - minLon;
    const mapHeight = maxLat - minLat;

    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;

    const scaleX = usableWidth / mapWidth;
    const scaleY = usableHeight / mapHeight;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = padding + (usableWidth - mapWidth * scale) / 2;
    const offsetY = padding + (usableHeight - mapHeight * scale) / 2;

    setProjectionConfig({
      minLon,
      maxLon,
      minLat,
      maxLat,
      scale,
      offsetX,
      offsetY,
    });
  };

  const project = (lon: number, lat: number) => {
    if (!projectionConfig) return [0, 0];
    const { minLon, minLat, scale, offsetX, offsetY } = projectionConfig;
    
    // Proyección equirectangular simple adaptada
    const x = offsetX + (lon - minLon) * scale;
    const y = height - (offsetY + (lat - minLat) * scale);
    return [x, y];
  };

  const getPathData = (geometry: any) => {
    if (!projectionConfig) return "";
    
    if (geometry.type === "Polygon") {
      return geometry.coordinates
        .map((ring: any) => {
          const points = ring.map((coord: number[]) => {
            const [x, y] = project(coord[0], coord[1]);
            return `${x.toFixed(1)} ${y.toFixed(1)}`;
          });
          return `M ${points.join(" L ")} Z`;
        })
        .join(" ");
    } else if (geometry.type === "MultiPolygon") {
      return geometry.coordinates
        .map((polygon: any) => {
          return polygon
            .map((ring: any) => {
              const points = ring.map((coord: number[]) => {
                const [x, y] = project(coord[0], coord[1]);
                return `${x.toFixed(1)} ${y.toFixed(1)}`;
              });
              return `M ${points.join(" L ")} Z`;
            })
            .join(" ");
        })
        .join(" ");
    }
    return "";
  };

  // Obtener lista ordenada de estados del GeoJSON
  const getStatesList = () => {
    if (!geoData) return [];
    return geoData.features
      .map((f: any) => f.properties.NAME_1)
      .filter((name: string) => name && name !== "Federal Dependencies")
      .sort((a: string, b: string) => a.localeCompare(b));
  };

  const states = getStatesList();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
      {/* Contenedor del Mapa (Lado Izquierdo) */}
      <div className="lg:col-span-8 flex flex-col items-center justify-center p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl relative min-h-[350px] md:min-h-[450px]">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-neutral-400">
            <RotateCw className="h-8 w-8 animate-spin" />
            <p className="text-xs font-medium">Cargando mapa interactivo...</p>
          </div>
        ) : (
          <>
            {/* Indicador del estado seleccionado en el mapa */}
            <div className="absolute top-4 left-4 z-10 bg-neutral-900/90 dark:bg-neutral-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-neutral-700/50 dark:border-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <Compass className="h-3.5 w-3.5 text-blue-400" />
              <span>
                {selectedState ? `Estado: ${selectedState}` : "Haz clic en un estado del mapa"}
              </span>
              {selectedState && (
                <button
                  onClick={() => onSelectState(null)}
                  className="ml-2 text-neutral-400 hover:text-white hover:underline cursor-pointer"
                >
                  Ver todos
                </button>
              )}
            </div>

            {/* Renderizado del SVG */}
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto max-w-[500px]"
            >
              <g>
                {geoData.features.map((feature: any, index: number) => {
                  const stateName = feature.properties.NAME_1;
                  const isSelected = selectedState === stateName;
                  const isHovered = hoveredState === stateName;
                  
                  if (stateName === "Federal Dependencies") return null;

                  return (
                    <path
                      key={index}
                      d={getPathData(feature.geometry)}
                      onClick={() => onSelectState(isSelected ? null : stateName)}
                      onMouseEnter={() => setHoveredState(stateName)}
                      onMouseLeave={() => setHoveredState(null)}
                      className={`transition-all duration-200 cursor-pointer stroke-white dark:stroke-neutral-950 stroke-[0.8] ${
                        isSelected
                          ? "fill-blue-500 dark:fill-blue-600 stroke-[1.5]"
                          : isHovered
                          ? "fill-blue-100 dark:fill-blue-950/40"
                          : "fill-neutral-100 dark:fill-neutral-800"
                      }`}
                    />
                  );
                })}
              </g>
            </svg>
          </>
        )}
      </div>

      {/* Grid de Accesos Rápidos de Estados (Lado Derecho) */}
      <div className="lg:col-span-4 flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
        <h4 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
          Selección Rápida por Estado
        </h4>
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto max-h-[300px] lg:max-h-[380px] pr-1">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onSelectState(null)}
                className={`col-span-2 text-left px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  selectedState === null
                    ? "bg-blue-500 text-white border-blue-600 shadow-sm"
                    : "bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                Mostrar todos los estados
              </button>
              {states.map((stateName: string) => {
                const isSelected = selectedState === stateName;
                return (
                  <button
                    key={stateName}
                    onClick={() => onSelectState(isSelected ? null : stateName)}
                    className={`text-left px-2.5 py-2 rounded-lg text-xs font-medium border truncate transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-500 text-white border-blue-600 shadow-sm"
                        : "bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                    }`}
                    title={stateName}
                  >
                    {stateName}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
