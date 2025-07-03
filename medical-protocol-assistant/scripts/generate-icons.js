/**
 * Simple script to generate placeholder icons for PWA
 * Run with: node scripts/generate-icons.js
 */

const fs = require("fs");
const path = require("path");

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, "../public/icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG template for the icon
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#6366f1" rx="${size * 0.1}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}px" font-weight="bold" text-anchor="middle" dy=".35em" fill="white">MP</text>
</svg>
`;

// Icon sizes to generate
const sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];

// Generate placeholder icons
sizes.forEach((size) => {
  const svg = createIconSVG(size);
  const filename =
    size === 180
      ? `apple-icon-${size}x${size}.svg`
      : `icon-${size}x${size}.svg`;

  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`Created ${filename}`);
});

// Create special purpose icons
const specialIcons = {
  "new-protocol.svg": createIconSVG(96).replace("MP", "+"),
  "dashboard.svg": createIconSVG(96).replace("MP", "📊"),
};

Object.entries(specialIcons).forEach(([filename, svg]) => {
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`Created ${filename}`);
});

console.log("\nAll placeholder icons created successfully!");
console.log(
  "Note: These are SVG placeholders. For production, convert to PNG with proper design.",
);
