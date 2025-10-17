// Simplified lazy icon loading utility
import { LucideIcon } from 'lucide-react';

// Cache for loaded icons to avoid re-importing
const iconCache = new Map<string, LucideIcon>();

export async function getLucideIcon(iconName: string, fallback: LucideIcon): Promise<LucideIcon> {
  // Check cache first
  if (iconCache.has(iconName)) {
    return iconCache.get(iconName)!;
  }

  // For now, just return the fallback to avoid build issues
  // This can be enhanced later with proper dynamic imports
  iconCache.set(iconName, fallback);
  return fallback;
}

// Preload common icons - simplified
export function preloadCommonIcons() {
  // No-op for now to avoid build issues
}
