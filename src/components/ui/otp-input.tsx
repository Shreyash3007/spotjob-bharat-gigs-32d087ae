import { useCallback, useRef, useState, KeyboardEvent, ChangeEvent } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  containerClassName?: string;
  inputClassName?: string;
}

export function OTPInput({
  value,
  onChange,
  maxLength = 6,
  containerClassName,
  inputClassName,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [inputValues, setInputValues] = useState<string[]>(
    value.split("").concat(Array(maxLength - value.length).fill(""))
  );

  const focusInput = useCallback(
    (index: number) => {
      if (index >= 0 && index < maxLength) {
        const input = inputRefs.current[index];
        if (input) {
          input.focus();
          input.select();
        }
      }
    },
    [maxLength]
  );

  const handleChange = useCallback(
    (index: number, e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.trim().slice(-1);
      if (!/^\d*$/.test(newValue) && newValue !== "") return;

      const newInputValues = [...inputValues];
      newInputValues[index] = newValue;
      setInputValues(newInputValues);

      const newOtpValue = newInputValues.join("");
      onChange(newOtpValue);

      // Move to next input if current input is filled
      if (newValue !== "" && index < maxLength - 1) {
        focusInput(index + 1);
      }
    },
    [inputValues, maxLength, onChange, focusInput]
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !inputValues[index] && index > 0) {
        // Move to previous input on backspace if current input is empty
        focusInput(index - 1);
      } else if (e.key === "ArrowLeft" && index > 0) {
        // Move to previous input on left arrow
        focusInput(index - 1);
      } else if (e.key === "ArrowRight" && index < maxLength - 1) {
        // Move to next input on right arrow
        focusInput(index + 1);
      }
    },
    [inputValues, maxLength, focusInput]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").trim();
      if (!/^\d*$/.test(pastedData)) return;

      const newOtpValue = pastedData.slice(0, maxLength);
      const newInputValues = newOtpValue
        .split("")
        .concat(Array(maxLength - newOtpValue.length).fill(""));

      setInputValues(newInputValues);
      onChange(newOtpValue);

      // Focus last filled input or the next empty one
      focusInput(Math.min(newOtpValue.length, maxLength - 1));
    },
    [maxLength, onChange, focusInput]
  );

  return (
    <div className={cn("flex gap-2", containerClassName)}>
      {Array(maxLength)
        .fill(0)
        .map((_, index) => (
          <input
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            maxLength={1}
            value={inputValues[index]}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={cn(
              "h-10 w-10 rounded-md border border-input bg-background text-center text-lg shadow-sm transition-all",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              inputClassName
            )}
          />
        ))}
    </div>
  );
} 