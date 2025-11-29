/**
 * PWA Screenshot Generator Script
 * 
 * This script generates placeholder screenshots for the PWA manifest.
 * Run with: node scripts/generate-pwa-screenshots.js
 * 
 * For production, replace these with actual app screenshots.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'public', 'screenshots');

// Screenshot configurations
const SCREENSHOTS = [
  {
    name: 'screenshot-wide.png',
    width: 1280,
    height: 720,
    text: 'World Sports Academy',
    subtext: 'Book courts, manage memberships, train with the best'
  },
  {
    name: 'screenshot-narrow.png',
    width: 720,
    height: 1280,
    text: 'World Sports Academy',
    subtext: 'Your sports companion on the go'
  }
];

async function generateScreenshots() {
  // Create screenshots directory if it doesn't exist
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    console.log('Created screenshots directory');
  }

  console.log('Generating PWA placeholder screenshots...\n');

  for (const screenshot of SCREENSHOTS) {
    const { name, width, height, text, subtext } = screenshot;
    const outputPath = path.join(SCREENSHOTS_DIR, name);

    // Create SVG with gradient background and text
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0a0a0a"/>
            <stop offset="50%" style="stop-color:#171717"/>
            <stop offset="100%" style="stop-color:#0a0a0a"/>
          </linearGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#f97316"/>
            <stop offset="100%" style="stop-color:#ea580c"/>
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bg)"/>
        
        <!-- Decorative circles -->
        <circle cx="${width * 0.2}" cy="${height * 0.3}" r="${Math.min(width, height) * 0.15}" fill="#f97316" opacity="0.05"/>
        <circle cx="${width * 0.8}" cy="${height * 0.7}" r="${Math.min(width, height) * 0.2}" fill="#f97316" opacity="0.03"/>
        
        <!-- Logo placeholder circle -->
        <circle cx="${width / 2}" cy="${height * 0.35}" r="${Math.min(width, height) * 0.1}" fill="#171717" stroke="#f97316" stroke-width="3"/>
        <text x="${width / 2}" y="${height * 0.37}" text-anchor="middle" fill="#f97316" font-family="system-ui, sans-serif" font-size="${Math.min(width, height) * 0.06}" font-weight="bold">WSA</text>
        
        <!-- Main text -->
        <text x="${width / 2}" y="${height * 0.55}" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-size="${Math.min(width, height) * 0.05}" font-weight="bold">${text}</text>
        
        <!-- Subtext -->
        <text x="${width / 2}" y="${height * 0.62}" text-anchor="middle" fill="#737373" font-family="system-ui, sans-serif" font-size="${Math.min(width, height) * 0.025}">${subtext}</text>
        
        <!-- Bottom gradient bar -->
        <rect x="${width * 0.3}" y="${height * 0.72}" width="${width * 0.4}" height="4" rx="2" fill="url(#accent)"/>
        
        <!-- Feature badges -->
        <rect x="${width * 0.15}" y="${height * 0.8}" width="${width * 0.2}" height="${height * 0.08}" rx="8" fill="#171717" stroke="#262626" stroke-width="1"/>
        <text x="${width * 0.25}" y="${height * 0.855}" text-anchor="middle" fill="#a3a3a3" font-family="system-ui, sans-serif" font-size="${Math.min(width, height) * 0.018}">Book Courts</text>
        
        <rect x="${width * 0.4}" y="${height * 0.8}" width="${width * 0.2}" height="${height * 0.08}" rx="8" fill="#171717" stroke="#262626" stroke-width="1"/>
        <text x="${width * 0.5}" y="${height * 0.855}" text-anchor="middle" fill="#a3a3a3" font-family="system-ui, sans-serif" font-size="${Math.min(width, height) * 0.018}">Memberships</text>
        
        <rect x="${width * 0.65}" y="${height * 0.8}" width="${width * 0.2}" height="${height * 0.08}" rx="8" fill="#171717" stroke="#262626" stroke-width="1"/>
        <text x="${width * 0.75}" y="${height * 0.855}" text-anchor="middle" fill="#a3a3a3" font-family="system-ui, sans-serif" font-size="${Math.min(width, height) * 0.018}">Programs</text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
    
    console.log(`Generated: ${name} (${width}x${height})`);
  }

  console.log('\n✅ All PWA screenshots generated successfully!');
  console.log('\n📝 Note: Replace these placeholder screenshots with actual app screenshots for production.');
  console.log('Generated screenshots in:', SCREENSHOTS_DIR);
}

generateScreenshots().catch(console.error);

