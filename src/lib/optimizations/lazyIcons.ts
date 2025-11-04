// Simplified lazy icon loading utility
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Cache for loaded icons to avoid re-importing
const iconCache = new Map<string, LucideIcon>();

// Helper function to convert icon name to PascalCase
function toPascalCase(iconName: string): string {
  return iconName
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part, idx) => 
      idx === 0
        ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join('');
}

export async function getLucideIcon(iconName: string, fallback: LucideIcon): Promise<LucideIcon> {
  // Check cache first
  if (iconCache.has(iconName)) {
    return iconCache.get(iconName)!;
  }

  try {
    // Try different variations of the icon name
    const variations = [
      iconName,
      toPascalCase(iconName),
      iconName.charAt(0).toUpperCase() + iconName.slice(1),
      iconName.replace(/[-_\s]+/g, '')
    ];

    for (const variation of variations) {
      const icon = (LucideIcons as Record<string, LucideIcon>)[variation];
      if (icon) {
        iconCache.set(iconName, icon);
        return icon;
      }
    }
  } catch (error) {
    console.warn(`Failed to load icon: ${iconName}`, error);
  }

  // Fallback to default icon
  iconCache.set(iconName, fallback);
  return fallback;
}

// Preload common icons - simplified
export function preloadCommonIcons() {
  // No-op for now to avoid build issues
}
