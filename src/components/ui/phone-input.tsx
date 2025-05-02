import React, { useState, useMemo } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./command";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Common country codes with flags
const countries = [
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+1", name: "United States", flag: "🇺🇸" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+977", name: "Nepal", flag: "🇳🇵" },
  { code: "+94", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩" },
];

export type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  onCountryChange?: (country: { code: string; name: string; flag: string }) => void;
  selectedCountry?: { code: string; name: string; flag: string };
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  "aria-label"?: string;
};

export function PhoneInput({
  value,
  onChange,
  onCountryChange,
  selectedCountry = countries[0], // Default to India
  error,
  placeholder = "Phone number",
  disabled = false,
  className,
  required = false,
  "aria-label": ariaLabel = "Phone number",
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);

  // Format the phone number as the user types (optional)
  const formatPhoneNumber = (input: string) => {
    // Remove any non-digit characters
    const digits = input.replace(/\D/g, "");
    onChange(digits);
  };

  // Add country code to the phone number if needed
  const fullPhoneNumber = useMemo(() => {
    if (!value) return "";
    return value.startsWith(selectedCountry.code) ? value : `${selectedCountry.code}${value}`;
  }, [value, selectedCountry.code]);

  return (
    <div className="flex flex-col space-y-1.5">
      <div className="flex">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label="Select country code"
              className="flex w-[115px] justify-between items-center rounded-r-none border-r-0"
              disabled={disabled}
            >
              <div className="flex items-center gap-1 truncate">
                <span className="text-base">{selectedCountry.flag}</span>
                <span className="text-sm font-medium">{selectedCountry.code}</span>
              </div>
              <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {countries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.code}`}
                    onSelect={() => {
                      if (onCountryChange) onCountryChange(country);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-base">{country.flag}</span>
                      <span className="text-sm">{country.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{country.code}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedCountry.code === country.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <Input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => formatPhoneNumber(e.target.value)}
          className={cn("rounded-l-none focus-visible:ring-0", className)}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-invalid={!!error}
          aria-describedby={error ? "phone-error" : undefined}
          required={required}
          autoComplete="tel"
        />
      </div>
      {error && (
        <p id="phone-error" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
} 