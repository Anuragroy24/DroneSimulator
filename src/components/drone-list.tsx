"use client"
import React from "react"
import { useDrones } from "../context/drones-context"
import { PillIcon as Drone, Trash2, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

export default function DroneList() {
  const { drones, activeDroneId, setActiveDroneId, removeDrone } = useDrones()

  if (Object.keys(drones).length === 0) {
    return (
      <div className="text-center p-6 bg-slate-50 rounded-md border border-slate-200">
        <Drone className="h-10 w-10 mx-auto mb-2 text-slate-300" />
        <p className="text-slate-500">No drones added yet</p>
        <p className="text-xs text-slate-400 mt-1">Add your first drone above</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {Object.values(drones).map((drone) => (
        <div
          key={drone.id}
          className={`p-3 rounded-md flex justify-between items-center transition-colors ${
            drone.id === activeDroneId
              ? "bg-blue-100 border border-blue-200"
              : "bg-slate-100 hover:bg-slate-200 border border-transparent"
          }`}
        >
          <div>
            <div className="font-medium">{drone.name}</div>
            <div className="text-xs text-slate-500 flex items-center mt-1">
              <Badge variant="outline" className="text-xs bg-white">
                {drone.waypoints.length} waypoints
              </Badge>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeDrone(drone.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveDroneId(drone.id)}
              className={drone.id === activeDroneId ? "text-blue-700" : ""}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

