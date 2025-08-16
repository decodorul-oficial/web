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
