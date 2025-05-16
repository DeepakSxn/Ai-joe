"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface TemperatureToggleProps {
  onTemperatureChange: (unit: "C" | "F") => void
  defaultUnit?: "C" | "F"
}

export default function TemperatureToggle({ 
  onTemperatureChange, 
  defaultUnit = "F" 
}: TemperatureToggleProps) {
  const [isCelsius, setIsCelsius] = useState(defaultUnit === "C")

  const handleToggle = (checked: boolean) => {
    setIsCelsius(checked)
    onTemperatureChange(checked ? "C" : "F")
  }

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="temperature-mode" className="text-sm font-medium text-gray-700">
        {isCelsius ? "°C" : "°F"}
      </Label>
      <Switch
        id="temperature-mode"
        checked={isCelsius}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-eoxs-green"
      />
    </div>
  )
} 