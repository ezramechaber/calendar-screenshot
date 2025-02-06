export const CALENDAR_COLORS = {
  // Modern vibrant palette
  default: {
    primary: '#3B82F6',    // Blue
    variants: [
      '#F43F5E',          // Rose/Red
      '#10B981',          // Emerald/Green
      '#8B5CF6',          // Purple
      '#F59E0B',          // Amber/Orange
    ]
  },
  // Keep monotone as fallback
  monotone: {
    primary: '#374151',    // Gray-700
    variants: [
      '#4B5563',          // Gray-600
      '#6B7280',          // Gray-500
      '#9CA3AF',          // Gray-400
      '#D1D5DB',          // Gray-300
    ]
  },
  // Modern muted colors
  muted: {
    primary: '#3B82F6',   // Blue
    variants: [
      '#EC4899',          // Pink
      '#10B981',          // Emerald
      '#8B5CF6',          // Purple
      '#F59E0B',          // Amber
    ]
  }
}

function adjustHue(color: string, amount: number): string {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)  // Fix substring indices
  const b = parseInt(hex.substring(4, 6), 16)  // Fix substring indices

  // Convert RGB to HSL
  const [h, s, l] = rgbToHsl(r, g, b)
  
  // Adjust hue by amount (keeping it within 0-360)
  const newHue = (h + amount + 360) % 360  // Ensure positive value
  
  // Convert back to RGB
  const [newR, newG, newB] = hslToRgb(newHue, s, l)
  
  // Ensure valid hex values
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`
}

function generateComplementaryColors(baseColor: string): string[] {
  try {
    return [
      baseColor,                    // Original color
      adjustHue(baseColor, 90),     // 90 degrees rotation
      adjustHue(baseColor, 180),    // Complementary color
      adjustHue(baseColor, 270),    // 270 degrees rotation
    ].filter((color, index, self) => 
      // Ensure unique colors and valid hex format
      color && color.match(/^#[0-9A-F]{6}$/i) && 
      self.indexOf(color) === index
    )
  } catch (e) {
    // Fallback to monotone colors if conversion fails
    return [
      CALENDAR_COLORS.monotone.primary,
      ...CALENDAR_COLORS.monotone.variants.slice(0, 3)
    ]
  }
}

export function getEventColor(baseColor?: string) {
  // If a background color is set and it's not white, use complementary colors
  if (baseColor && baseColor !== '#ffffff') {
    const complementaryColors = generateComplementaryColors(baseColor)
    return {
      colors: complementaryColors,
      textColor: isLightColor(baseColor) ? '#000000' : '#ffffff',
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
    }
  }

  // Otherwise, use our vibrant default palette
  return {
    colors: [
      CALENDAR_COLORS.default.primary,
      ...CALENDAR_COLORS.default.variants.slice(0, 3)  // Take first 3 variants
    ],
    textColor: '#ffffff',
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
  }
}

export function isLightColor(color: string): boolean {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128
}

// Helper functions for color conversion
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return [h * 360, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const r = hue2rgb(p, q, (h / 360 + 1/3))
  const g = hue2rgb(p, q, h / 360)
  const b = hue2rgb(p, q, (h / 360 - 1/3))

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  ]
} 