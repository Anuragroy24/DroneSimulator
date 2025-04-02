"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"
import { Input } from "./ui/input"
import { useDrones } from "../context/drones-context"
import { useToast } from "../hooks/use-toast"

// OpenStreetMap Nominatim search API
const SEARCH_API = "https://nominatim.openstreetmap.org/search"

interface SearchResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

export default function SearchBox() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { activeDroneId, addWaypoint, setMapCenter } = useDrones()
  const { toast } = useToast()

  // Handle clicks outside the search box to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Search for locations with debounce
  useEffect(() => {
    if (!query.trim() || query.length < 3) return

    const timer = setTimeout(() => {
      performSearch(query)
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  // Search for locations
  const performSearch = async (searchQuery: string) => {
    setIsSearching(true)

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        format: "json",
        limit: "5",
      })

      const response = await fetch(`${SEARCH_API}?${params}`)
      const data = await response.json()

      setResults(data)
      setShowResults(true)
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search Error",
        description: "Failed to search for locations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Handle selecting a search result
  const handleSelectLocation = (result: SearchResult) => {
    const lat = Number.parseFloat(result.lat)
    const lng = Number.parseFloat(result.lon)

    // Set map center to the selected location
    setMapCenter([lat, lng])

    // Add as waypoint if a drone is selected
    if (activeDroneId) {
      addWaypoint(activeDroneId, { lat, lng })
      toast({
        title: "Waypoint Added",
        description: `Added ${result.display_name.split(",")[0]} as a waypoint`,
      })
    }

    setShowResults(false)
    setQuery("")
  }

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center relative">
        <Input
          className="pr-10 bg-white shadow-lg rounded-full pl-10 border-2 border-blue-100 focus:border-blue-300 transition-all"
          placeholder="Search for a location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && performSearch(query)}
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
        <Search className="h-4 w-4 absolute left-3 text-slate-400" />
        {isSearching && <Loader2 className="h-4 w-4 absolute right-3 animate-spin text-blue-500" />}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-blue-100">
          {results.map((result) => (
            <div
              key={result.place_id}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 flex items-start gap-2"
              onClick={() => handleSelectLocation(result)}
            >
              <MapPin className="h-4 w-4 mt-1 text-blue-500 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium">{result.display_name.split(",")[0]}</div>
                <div className="text-xs text-slate-500 truncate">{result.display_name}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !isSearching && query.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg p-3 text-center border border-blue-100">
          <p className="text-sm text-slate-500">No locations found</p>
        </div>
      )}
    </div>
  )
}

