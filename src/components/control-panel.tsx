"use client"

import React from "react"
import { useState } from "react"
import {
  Play,
  Pause,
  Plus,
  Upload,
  Trash2,
  Clock,
  ChevronRight,
  PillIcon as Drone,
  RotateCw,
  Compass,
  Navigation,
  MapPin,
  Layers,
} from "lucide-react"
import { useDrones } from "../context/drones-context"
import DroneList from "./drone-list"
import FileUpload from "./file-upload"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

export default function ControlPanel() {
  const {
    drones,
    activeDroneId,
    setActiveDroneId,
    addDrone,
    addWaypoint,
    removeWaypoint,
    isSimulating,
    toggleSimulation,
    simulationSpeed,
    setSimulationSpeed,
    simulationProgress,
    setSimulationProgress,
    resetSimulation,
  } = useDrones()

  const [newDroneName, setNewDroneName] = useState("")
  const [newWaypoint, setNewWaypoint] = useState({ lat: "", lng: "", altitude: "" })

  const activeDrone = activeDroneId ? drones[activeDroneId] : null

  const handleAddDrone = () => {
    if (newDroneName.trim()) {
      addDrone(newDroneName.trim())
      setNewDroneName("")
    }
  }

  const handleAddWaypoint = () => {
    if (activeDroneId && newWaypoint.lat && newWaypoint.lng) {
      const lat = Number.parseFloat(newWaypoint.lat)
      const lng = Number.parseFloat(newWaypoint.lng)
      const altitude = newWaypoint.altitude ? Number.parseFloat(newWaypoint.altitude) : undefined

      if (!isNaN(lat) && !isNaN(lng)) {
        addWaypoint(activeDroneId, {
          lat,
          lng,
          altitude: !isNaN(altitude as number) ? altitude : undefined,
        })
        setNewWaypoint({ lat: "", lng: "", altitude: "" })
      }
    }
  }

  // Helper function to format time from progress
  const formatTime = (progress: number) => {
    // Assuming a 10-minute total flight time
    const totalSeconds = progress * 600
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="w-96 bg-slate-50 p-4 overflow-y-auto border-l border-slate-200">
      <Tabs defaultValue="drones">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="drones" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Drone className="mr-2 h-4 w-4" />
            Drones
          </TabsTrigger>
          <TabsTrigger value="waypoints" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Navigation className="mr-2 h-4 w-4" />
            Waypoints
          </TabsTrigger>
          <TabsTrigger value="simulation" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Play className="mr-2 h-4 w-4" />
            Simulation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drones">
          <Card className="border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="flex items-center">
                <Drone className="mr-2 h-5 w-5 text-blue-500" />
                Drone Fleet
              </CardTitle>
              <CardDescription className="">Manage your drone fleet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="New drone name"
                  value={newDroneName}
                  onChange={(e) => setNewDroneName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddDrone()}
                  className="border-blue-200 focus:border-blue-400"
                />
                <Button onClick={handleAddDrone} className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              <DroneList />

              <Separator className="my-4" />

              <div className="pt-2">
                <div className="text-sm font-medium mb-2 flex items-center">
                  <Upload className="h-4 w-4 mr-2 text-blue-500" />
                  Import Data
                </div>
                <FileUpload />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waypoints">
          <Card className="border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Navigation className="mr-2 h-5 w-5 text-blue-500" />
                  Waypoints
                </CardTitle>
                {activeDrone && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    {activeDrone.name}
                  </Badge>
                )}
              </div>
              <CardDescription>
                {activeDrone ? `Define flight path for ${activeDrone.name}` : "Select a drone to manage waypoints"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {activeDrone ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className="text-sm font-medium flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-blue-500" />
                        Latitude
                      </Label>
                      <Input
                        id="latitude"
                        placeholder="e.g. 51.505"
                        value={newWaypoint.lat}
                        onChange={(e) => setNewWaypoint({ ...newWaypoint, lat: e.target.value })}
                        className="border-blue-200 focus:border-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude" className="text-sm font-medium flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-blue-500" />
                        Longitude
                      </Label>
                      <Input
                        id="longitude"
                        placeholder="e.g. -0.09"
                        value={newWaypoint.lng}
                        onChange={(e) => setNewWaypoint({ ...newWaypoint, lng: e.target.value })}
                        className="border-blue-200 focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="altitude" className="text-sm font-medium flex items-center">
                      <Layers className="h-3 w-3 mr-1 text-blue-500" />
                      Altitude (optional)
                    </Label>
                    <Input
                      id="altitude"
                      placeholder="e.g. 100 (meters)"
                      value={newWaypoint.altitude}
                      onChange={(e) => setNewWaypoint({ ...newWaypoint, altitude: e.target.value })}
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>

                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    onClick={handleAddWaypoint}
                    disabled={!newWaypoint.lat || !newWaypoint.lng}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Waypoint
                  </Button>

                  <div className="border rounded-md border-blue-100 overflow-hidden">
                    <div className="p-2 bg-blue-50 font-medium flex items-center justify-between">
                      <div className="flex items-center">
                        <Compass className="h-4 w-4 mr-2 text-blue-500" />
                        Waypoints
                      </div>
                      <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
                        {activeDrone.waypoints.length}
                      </Badge>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {activeDrone.waypoints.length > 0 ? (
                        <div className="divide-y divide-blue-100">
                          {activeDrone.waypoints.map((waypoint, index) => (
                            <div
                              key={index}
                              className="p-3 flex justify-between items-center hover:bg-blue-50 transition-colors"
                            >
                              <div>
                                <div className="font-medium flex items-center">
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs mr-2">
                                    {index + 1}
                                  </span>
                                  Waypoint {index + 1}
                                </div>
                                <div className="text-sm text-slate-500 mt-1">
                                  {waypoint.lat.toFixed(6)}, {waypoint.lng.toFixed(6)}
                                  {waypoint.altitude && `, ${waypoint.altitude}m`}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => activeDroneId && removeWaypoint(activeDroneId, index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-500">
                          <Navigation className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                          <p>No waypoints added yet</p>
                          <p className="text-xs mt-1">Search for locations or add coordinates manually</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-8">
                  <Drone className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500">Please select a drone first</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => {
                      const element = document.querySelector('[data-state="inactive"][value="drones"]')
                      if (element instanceof HTMLElement) {
                        element.click()
                      }
                    }}
                  >
                    Go to Drones Tab
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulation">
          <Card className="border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="flex items-center">
                <Play className="mr-2 h-5 w-5 text-blue-500" />
                Simulation Controls
              </CardTitle>
              <CardDescription>Control the drone simulation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="flex space-x-2">
                <Button
                  className={`flex-1 ${isSimulating ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-500 hover:bg-blue-600"}`}
                  onClick={toggleSimulation}
                  disabled={!activeDrone || activeDrone.waypoints.length < 2}
                >
                  {isSimulating ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetSimulation}
                  disabled={!activeDrone || activeDrone.waypoints.length < 2}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-3 bg-blue-50 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm font-medium">Flight Time</span>
                  </div>
                  <span className="text-sm font-mono bg-white px-2 py-1 rounded border border-blue-200">
                    {formatTime(simulationProgress)}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Simulation Speed</Label>
                      <span className="text-sm font-medium">{simulationSpeed}x</span>
                    </div>
                    <Slider
                      value={[simulationSpeed]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={(value) => setSimulationSpeed(value[0])}
                      className="[&>span:first-child]:h-2 [&>span:first-child]:bg-blue-200 [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&>span:first-child_span]:bg-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Progress</Label>
                      <span className="text-sm font-medium">{Math.round(simulationProgress * 100)}%</span>
                    </div>
                    <Slider
                      value={[simulationProgress * 100]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => setSimulationProgress(value[0] / 100)}
                      disabled={!isSimulating}
                      className="[&>span:first-child]:h-2 [&>span:first-child]:bg-blue-200 [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&>span:first-child_span]:bg-blue-500"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-2" />

              <div>
                <div className="text-sm font-medium mb-2 flex items-center">
                  <Drone className="h-4 w-4 mr-2 text-blue-500" />
                  Active Drones
                </div>
                {Object.values(drones).length > 0 ? (
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
                            <Navigation className="h-3 w-3 mr-1" />
                            {drone.waypoints.length} waypoints
                          </div>
                        </div>
                        <div className="flex space-x-1">
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
                ) : (
                  <div className="text-center p-6 bg-slate-50 rounded-md border border-slate-200">
                    <Drone className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-slate-500">No drones added yet</p>
                    <Button
                      variant="outline"
                      className="mt-4 border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        const element = document.querySelector('[data-state="inactive"][value="drones"]')
                        if (element instanceof HTMLElement) {
                          element.click()
                        }
                      }}
                    >
                      Add Drone
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

