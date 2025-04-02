"use client"

import React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Waypoint {
  lat: number
  lng: number
  altitude?: number
}

export interface Drone {
  id: string
  name: string
  waypoints: Waypoint[]
  position?: {
    lat: number
    lng: number
    altitude?: number
  }
}

interface DronesContextType {
  drones: Record<string, Drone>
  activeDroneId: string | null
  setActiveDroneId: (id: string | null) => void
  addDrone: (name: string) => void
  removeDrone: (id: string) => void
  addWaypoint: (droneId: string, waypoint: Waypoint) => void
  removeWaypoint: (droneId: string, index: number) => void
  isSimulating: boolean
  toggleSimulation: () => void
  simulationSpeed: number
  setSimulationSpeed: (speed: number) => void
  simulationProgress: number
  setSimulationProgress: (progress: number) => void
  resetSimulation: () => void
  importDrones: (data: any) => void
  mapCenter: [number, number] | null
  setMapCenter: (center: [number, number]) => void
}

const DronesContext = createContext<DronesContextType | undefined>(undefined)

export function DronesProvider({ children }: { children: React.ReactNode }) {
  const [drones, setDrones] = useState<Record<string, Drone>>({})
  const [activeDroneId, setActiveDroneId] = useState<string | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)

  // Load drones from localStorage on initial render
  useEffect(() => {
    try {
      const savedDrones = localStorage.getItem("drones")
      if (savedDrones) {
        setDrones(JSON.parse(savedDrones))
      }
    } catch (error) {
      console.error("Failed to load drones from localStorage:", error)
    }
  }, [])

  // Save drones to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("drones", JSON.stringify(drones))
    } catch (error) {
      console.error("Failed to save drones to localStorage:", error)
    }
  }, [drones])

  const addDrone = (name: string) => {
    const id = `drone-${Date.now()}`
    const newDrone: Drone = {
      id,
      name,
      waypoints: [],
    }

    setDrones((prev) => ({
      ...prev,
      [id]: newDrone,
    }))

    setActiveDroneId(id)
  }

  const removeDrone = (id: string) => {
    setDrones((prev) => {
      const newDrones = { ...prev }
      delete newDrones[id]
      return newDrones
    })

    if (activeDroneId === id) {
      setActiveDroneId(null)
    }
  }

  const addWaypoint = (droneId: string, waypoint: Waypoint) => {
    setDrones((prev) => ({
      ...prev,
      [droneId]: {
        ...prev[droneId],
        waypoints: [...prev[droneId].waypoints, waypoint],
      },
    }))
  }

  const removeWaypoint = (droneId: string, index: number) => {
    setDrones((prev) => ({
      ...prev,
      [droneId]: {
        ...prev[droneId],
        waypoints: prev[droneId].waypoints.filter((_, i) => i !== index),
      },
    }))
  }

  const toggleSimulation = () => {
    setIsSimulating((prev) => !prev)
  }

  const resetSimulation = () => {
    setSimulationProgress(0)
    setIsSimulating(false)
  }

  const importDrones = (data: any) => {
    try {
      if (data && typeof data === "object") {
        // If data is an array, convert to object with IDs as keys
        if (Array.isArray(data)) {
          const dronesObject: Record<string, Drone> = {}
          data.forEach((drone) => {
            if (drone.id && drone.name) {
              dronesObject[drone.id] = {
                id: drone.id,
                name: drone.name,
                waypoints: Array.isArray(drone.waypoints) ? drone.waypoints : [],
              }
            }
          })
          setDrones(dronesObject)
        }
        // If data is already an object with drone IDs as keys
        else {
          const validDrones: Record<string, Drone> = {}
          Object.entries(data).forEach(([id, drone]: [string, any]) => {
            if (drone.name) {
              validDrones[id] = {
                id,
                name: drone.name,
                waypoints: Array.isArray(drone.waypoints) ? drone.waypoints : [],
              }
            }
          })
          setDrones(validDrones)
        }
      }
    } catch (error) {
      console.error("Failed to import drones:", error)
    }
  }

  return (
    <DronesContext.Provider
      value={{
        drones,
        activeDroneId,
        setActiveDroneId,
        addDrone,
        removeDrone,
        addWaypoint,
        removeWaypoint,
        isSimulating,
        toggleSimulation,
        simulationSpeed,
        setSimulationSpeed,
        simulationProgress,
        setSimulationProgress,
        resetSimulation,
        importDrones,
        mapCenter,
        setMapCenter,
      }}
    >
      {children}
    </DronesContext.Provider>
  )
}

export function useDrones() {
  const context = useContext(DronesContext)
  if (context === undefined) {
    throw new Error("useDrones must be used within a DronesProvider")
  }
  return context
}

