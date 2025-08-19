/**
 * Generates a Monitorul Oficial URL from a filename
 * @param filename - The filename from the API response
 * @returns The complete URL to the Monitorul Oficial document through our proxy
 * Optimizat pentru a fi mai rapid
 */
export function generateMonitorulOficialUrl(filename?: string): string | null {
  if (!filename) return null;
  
  // Remove .pdf extension if it exists
  const filenameWithoutExtension = filename.replace(/\.pdf$/i, '');
  
  // Compose the original Monitorul Oficial URL
  const originalUrl = `https://monitoruloficial.ro/${filenameWithoutExtension}.html`;
  
  // Return our proxy API route URL
  return `/api/monitorul-oficial?url=${encodeURIComponent(originalUrl)}`;
}

/**
 * Extracts the "partea" (part) from a Monitorul Oficial filename
 * @param filename - The filename from the API response (e.g., "Monitorul-Oficial--PII--31c--2025.pdf")
 * @returns The formatted part string (e.g., "Partea II") or null if not found
 */
export function extractParteaFromFilename(filename?: string): string | null {
  if (!filename) return null;
  
  // Pattern: Monitorul-Oficial--PII--31c--2025.pdf
  // Extract the part between "--" and "--" that starts with "P"
  const match = filename.match(/--(P[IVX]+)--/);
  
  if (!match) return null;
  
  const partCode = match[1]; // e.g., "PII"
  
  // Convert Roman numerals to Arabic and format
  const partNumber = convertRomanToArabic(partCode.substring(1)); // Remove "P" prefix
  
  if (partNumber === null) return null;
  
  return `Partea ${partNumber}`;
}

/**
 * Converts Roman numerals to Arabic numbers
 * @param roman - Roman numeral string (e.g., "II", "III", "IV")
 * @returns Arabic number or null if invalid
 */
function convertRomanToArabic(roman: string): number | null {
  const romanNumerals: Record<string, number> = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
  };
  
  let result = 0;
  let prevValue = 0;
  
  for (let i = roman.length - 1; i >= 0; i--) {
    const currentValue = romanNumerals[roman[i]];
    
    if (currentValue === undefined) {
      return null; // Invalid Roman numeral
    }
    
    if (currentValue >= prevValue) {
      result += currentValue;
    } else {
      result -= currentValue;
    }
    
    prevValue = currentValue;
  }
  
  return result;
}
