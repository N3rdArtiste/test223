// useUnlockField.ts
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormValues } from "./types";

/**
 * Hook for determining whether a field (and its subsequent step) 
 * should be unlocked (visible) once valid, and remain visible afterward.
 *
 * @param fieldName - The name of the field (key of FormValues)
 * @param condition - (optional) A function to further check the field's value
 */
export function useUnlockField(
  fieldName: keyof FormValues,
  condition?: (value: any) => boolean
): boolean {
  const { watch, formState: { errors } } = useFormContext<FormValues>();
  
  // Tracks whether we've already unlocked this step
  const [unlocked, setUnlocked] = useState(false);
  
  // Get the current value of the field from React Hook Form
  const fieldValue = watch(fieldName);

  // Run effect to unlock step once the field is valid and meets the condition
  useEffect(() => {
    const hasNoError = !errors[fieldName];
    const meetsCondition = condition ? condition(fieldValue) : true;

    if (hasNoError && meetsCondition) {
      // Once unlocked, stay unlocked
      setUnlocked(true);
    }
  }, [errors, fieldName, fieldValue, condition]);

  /**
   * We consider the field "visible" if:
   * 1) we have already unlocked it, OR
   * 2) it's currently valid + meets the optional condition
   */
  const isVisible =
    unlocked ||
    (!errors[fieldName] && (condition ? condition(fieldValue) : !!fieldValue));

  return isVisible;
}