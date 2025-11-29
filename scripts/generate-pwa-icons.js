/**
 * PWA Icon Generator Script
 * 
 * This script generates all required PWA icons from a source image.
 * Run with: node scripts/generate-pwa-icons.js
 * 
 * Prerequisites: npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');
const SOURCE_IMAGE = path.join(__dirname, '..', 'public', 'logo.png');

// Icon sizes for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Maskable icon sizes (for Android adaptive icons)
const MASKABLE_SIZES = [192, 512];

// Apple touch icon sizes
const APPLE_SIZES = [120, 152, 167, 180];

// Shortcut icon size
const SHORTCUT_SIZE = 96;

async function generateIcons() {
  // Create icons directory if it doesn't exist
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
    console.log('Created icons directory');
  }

  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error(`Source image not found: ${SOURCE_IMAGE}`);
    console.log('Please ensure logo.png exists in the public folder.');
    process.exit(1);
  }

  console.log('Generating PWA icons from:', SOURCE_IMAGE);

  // Generate standard icons
  for (const size of ICON_SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    await sharp(SOURCE_IMAGE)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 10, g: 10, b: 10, alpha: 1 } // Dark background matching theme
      })
      .png()
      .toFile(outputPath);
    console.log(`Generated: icon-${size}x${size}.png`);
  }

  // Generate maskable icons (with padding for safe zone)
  for (const size of MASKABLE_SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-maskable-${size}x${size}.png`);
    const iconSize = Math.floor(size * 0.6); // Icon takes 60% of the canvas (safe zone)
    const padding = Math.floor((size - iconSize) / 2);

    // Create a canvas with the icon centered
    await sharp(SOURCE_IMAGE)
      .resize(iconSize, iconSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 249, g: 115, b: 22, alpha: 1 } // Orange theme color
      })
      .png()
      .toFile(outputPath);
    console.log(`Generated: icon-maskable-${size}x${size}.png`);
  }

  // Generate Apple touch icons
  for (const size of APPLE_SIZES) {
    const outputPath = path.join(ICONS_DIR, `apple-touch-icon-${size}x${size}.png`);
    await sharp(SOURCE_IMAGE)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 10, g: 10, b: 10, alpha: 1 }
      })
      .png()
      .toFile(outputPath);
    console.log(`Generated: apple-touch-icon-${size}x${size}.png`);
  }

  // Generate main apple-touch-icon (180x180 is the recommended size)
  const appleOutputPath = path.join(ICONS_DIR, 'apple-touch-icon.png');
  await sharp(SOURCE_IMAGE)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 10, g: 10, b: 10, alpha: 1 }
    })
    .png()
    .toFile(appleOutputPath);
  console.log('Generated: apple-touch-icon.png');

  // Generate shortcut icons
  const shortcuts = ['book', 'bookings', 'membership'];
  for (const shortcut of shortcuts) {
    const outputPath = path.join(ICONS_DIR, `shortcut-${shortcut}.png`);
    await sharp(SOURCE_IMAGE)
      .resize(SHORTCUT_SIZE, SHORTCUT_SIZE, {
        fit: 'contain',
        background: { r: 10, g: 10, b: 10, alpha: 1 }
      })
      .png()
      .toFile(outputPath);
    console.log(`Generated: shortcut-${shortcut}.png`);
  }

  // Generate favicon-32x32 and favicon-16x16
  for (const size of [16, 32]) {
    const outputPath = path.join(ICONS_DIR, `favicon-${size}x${size}.png`);
    await sharp(SOURCE_IMAGE)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 10, g: 10, b: 10, alpha: 1 }
      })
      .png()
      .toFile(outputPath);
    console.log(`Generated: favicon-${size}x${size}.png`);
  }

  console.log('\n✅ All PWA icons generated successfully!');
  console.log('\nGenerated icons in:', ICONS_DIR);
}

generateIcons().catch(console.error);

