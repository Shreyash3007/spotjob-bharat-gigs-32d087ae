import React from "react";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export interface RadiusSelectorProps {
  radius: number;
  onChange: (radius: number) => void;
  className?: string;
  showLabel?: boolean;
}

const PRESET_RADIUS_VALUES = [1, 5, 10, 25, 50];

const RadiusSelector: React.FC<RadiusSelectorProps> = ({
  radius,
  onChange,
  className = "",
  showLabel = true,
}) => {
  // Format the radius display
  const formatRadius = (value: number) => {
    return value < 1 ? `${value * 1000}m` : `${value}km`;
  };

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    onChange(value[0]);
  };

  // Handle dropdown selection
  const handleDropdownChange = (value: string) => {
    onChange(Number(value));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <label htmlFor="radius-slider" className="text-sm font-medium flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-primary" />
            Search Radius
          </label>
          <span className="text-sm font-medium text-primary">{formatRadius(radius)}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Slider
          id="radius-slider"
          min={0.5}
          max={50}
          step={0.5}
          value={[radius]}
          onValueChange={handleSliderChange}
          className="flex-1"
          aria-label="Select search radius"
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-20">
              {formatRadius(radius)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={radius.toString()} onValueChange={handleDropdownChange}>
              {PRESET_RADIUS_VALUES.map((value) => (
                <DropdownMenuRadioItem key={value} value={value.toString()}>
                  {formatRadius(value)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default RadiusSelector; 