"use client"

import React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Upload, Check, AlertCircle } from "lucide-react"
import { useDrones } from "../context/drones-context"

export default function FileUpload() {
  const { importDrones } = useDrones()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length) {
      handleFile(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type !== "application/json") {
      setUploadStatus("error")
      setErrorMessage("Only JSON files are supported")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        importDrones(data)
        setUploadStatus("success")
        setTimeout(() => setUploadStatus("idle"), 3000)
      } catch (error) {
        setUploadStatus("error")
        setErrorMessage("Invalid JSON format")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div
      className={`border-2 border-dashed rounded-md p-4 text-center transition-colors ${
        isDragging
          ? "border-blue-400 bg-blue-50"
          : uploadStatus === "success"
            ? "border-green-400 bg-green-50"
            : uploadStatus === "error"
              ? "border-red-400 bg-red-50"
              : "border-slate-200 hover:border-blue-300"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {uploadStatus === "idle" && (
        <>
          <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
          <p className="text-sm text-slate-600">Drag & drop a JSON file or</p>
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="text-sm text-blue-500 hover:text-blue-700">browse files</span>
            <input id="file-upload" type="file" accept=".json" className="hidden" onChange={handleFileChange} />
          </label>
        </>
      )}

      {uploadStatus === "success" && (
        <div className="text-green-600">
          <Check className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">File uploaded successfully!</p>
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="text-red-600">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{errorMessage}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-xs border-red-300 hover:bg-red-100"
            onClick={() => setUploadStatus("idle")}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}

