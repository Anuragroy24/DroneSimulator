import React from "react"
import { DronesProvider } from "./context/drones-context"
import MapComponent from "./components/map-componeent"
import ControlPanel from "./components/control-panel"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/toaster"

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="drone-simulator-theme">
      <DronesProvider>
        <div className="flex h-screen">
          <div className="flex-1 relative">
            <MapComponent />
          </div>
          <ControlPanel />
        </div>
        <Toaster />
      </DronesProvider>
    </ThemeProvider>
  )
}

export default App

