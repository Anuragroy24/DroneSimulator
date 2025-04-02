"use client"

import React, { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import "leaflet-defaulticon-compatibility"
import { useDrones } from "../context/drones-context"
import SearchBox from "./search-box"

// Custom animated drone icon
const createDroneIcon = (color = "#3b82f6") => {
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="absolute w-8 h-8 bg-${color.replace("#", "")} rounded-full opacity-20 animate-ping"></div>
        <div class="relative w-6 h-6 bg-white rounded-full border-2 border-${color.replace("#", "")} flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="w-4 h-4">
            <path d="M6 12a.75.75 0 01-.75-.75v-6a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-5.25v5.25a.75.75 0 01-.75.75zm12 0a.75.75 0 01-.75-.75V5.25h-5.25a.75.75 0 010-1.5h6a.75.75 0 01.75.75v6.75a.75.75 0 01-.75.75zM6 24a.75.75 0 01-.75-.75v-6.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5H6.75v6a.75.75 0 01-.75.75zm12 0a.75.75 0 01-.75-.75v-6h-5.25a.75.75 0 010-1.5h6a.75.75 0 01.75.75v6.75a.75.75 0 01-.75.75z"/>
          </svg>
        </div>
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

// Component to handle map center updates
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom())
    }
  }, [center, map])

  return null
}

export default function MapComponent() {
  const { drones, activeDroneId, isSimulating, mapCenter } = useDrones()
  const mapRef = useRef<L.Map | null>(null)
  const [mapStyle, setMapStyle] = useState<string>("streets")

  // Fix for Leaflet icon issue in React
  useEffect(() => {
    // This is a workaround for the Leaflet icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
    })
  }, [])

  // Generate different colors for each drone path
  const getPathColor = (index: number) => {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#F033FF", "#FF33A8", "#33FFF5"]
    return colors[index % colors.length]
  }

  // Map style options
  const mapStyles = {
    streets:
      "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    satellite:
      "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    dark: "https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
  }

  return (
    <div className="relative flex-1 h-full">
      <MapContainer
        center={[51.505, -0.09]} // Default center (London)
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        whenReady={() => {
          if (mapRef.current) {
            mapRef.current = mapRef.current;
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
          url={mapStyles[mapStyle as keyof typeof mapStyles]}
        />

        <MapController center={mapCenter} />

        {/* Render all drone paths */}
        {Object.entries(drones).map(([droneId, drone], index) => (
          <React.Fragment key={droneId}>
            {/* Render the planned path */}
            {drone.waypoints.length > 1 && (
              <Polyline
                positions={drone.waypoints.map((wp) => [wp.lat, wp.lng])}
                color={getPathColor(index)}
                weight={4}
                opacity={0.7}
                dashArray={drone.id === activeDroneId ? undefined : "5, 5"}
              />
            )}

            {/* Live path progress - show the traveled path with different styling */}
            {isSimulating && drone.position && drone.waypoints.length > 1 && (
              <Polyline
                positions={[
                  ...drone.waypoints.slice(
                    0,
                    drone.waypoints.findIndex((wp) => wp.lat > drone.position!.lat && wp.lng > drone.position!.lng) + 1,
                  ),
                  [drone.position.lat, drone.position.lng],
                ]}
                color={getPathColor(index)}
                weight={6}
                opacity={1}
              />
            )}

            {/* Render all waypoints */}
            {drone.waypoints.map((waypoint, wpIndex) => (
              <React.Fragment key={`${droneId}-wp-${wpIndex}`}>
                <Circle
                  center={[waypoint.lat, waypoint.lng]}
                  radius={50}
                  pathOptions={{
                    color: getPathColor(index),
                    fillColor: getPathColor(index),
                    fillOpacity: 0.3,
                  }}
                />
                <Marker
                  position={[waypoint.lat, waypoint.lng]}
                  icon={
                    new L.DivIcon({
                      html: `<div class="h-4 w-4 rounded-full bg-white border-2 border-${getPathColor(index).replace("#", "")} flex items-center justify-center text-xs font-bold">${wpIndex + 1}</div>`,
                      className: "",
                    })
                  }
                >
                  <Popup>
                    <div>
                      <p className="font-bold">
                        {drone.name} - Waypoint {wpIndex + 1}
                      </p>
                      <p>Lat: {waypoint.lat.toFixed(6)}</p>
                      <p>Lng: {waypoint.lng.toFixed(6)}</p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}

            {/* Render the drone at its current position with animation */}
            {drone.position && (
              <Marker position={[drone.position.lat, drone.position.lng]} icon={createDroneIcon(getPathColor(index))}>
                <Popup>
                  <div>
                    <p className="font-bold">{drone.name}</p>
                    <p>Current Position:</p>
                    <p>Lat: {drone.position.lat.toFixed(6)}</p>
                    <p>Lng: {drone.position.lng.toFixed(6)}</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </React.Fragment>
        ))}
      </MapContainer>

      <div className="absolute top-4 left-4 z-[1000] w-72">
        <SearchBox />
      </div>

      {/* Map style selector */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-md shadow-lg p-2">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-md ${mapStyle === "streets" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setMapStyle("streets")}
          >
            Streets
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${mapStyle === "satellite" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setMapStyle("satellite")}
          >
            Satellite
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${mapStyle === "dark" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setMapStyle("dark")}
          >
            Dark
          </button>
        </div>
      </div>
    </div>
  )
}

