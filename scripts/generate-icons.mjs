import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const logoPath = path.resolve('public/logo.png');
const iconsDir = path.resolve('public/icons');

const sizes = {
    apple: [120, 152, 167, 180],
    favicon: [16, 32],
    icon: [72, 96, 128, 144, 152, 192, 384, 512],
    maskable: [192, 512],
    shortcut: [96]
};

// Match the App Background Color #0a0a0a
const bg = { r: 10, g: 10, b: 10, alpha: 1 };

async function generate() {
    if (!fs.existsSync(logoPath)) {
        console.error(`Logo not found at ${logoPath}`);
        return;
    }

    const logoBuffer = fs.readFileSync(logoPath);

    // Basic icons (transparent)
    for (const size of sizes.icon) {
        await sharp(logoBuffer).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    }

    for (const size of sizes.favicon) {
        await sharp(logoBuffer).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .toFile(path.join(iconsDir, `favicon-${size}x${size}.png`));
    }

    for (const size of sizes.shortcut) {
        await sharp(logoBuffer).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .toFile(path.join(iconsDir, `shortcut-book.png`));
        await fs.promises.copyFile(path.join(iconsDir, `shortcut-book.png`), path.join(iconsDir, `shortcut-bookings.png`));
        await fs.promises.copyFile(path.join(iconsDir, `shortcut-book.png`), path.join(iconsDir, `shortcut-membership.png`));
    }

    // Apple touch icons (solid background)
    for (const size of sizes.apple) {
        const filename = `apple-touch-icon-${size}x${size}.png`;

        // Create base background
        const base = sharp({ create: { width: size, height: size, channels: 4, background: bg } });

        // Resize inner logo to 80% to fit neatly
        const innerSize = Math.round(size * 0.8);
        const innerLogo = await sharp(logoBuffer).resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();

        await base.composite([{ input: innerLogo }]).png().toFile(path.join(iconsDir, filename));

        if (size === 180) {
            await fs.promises.copyFile(path.join(iconsDir, filename), path.join(iconsDir, 'apple-touch-icon.png'));
        }
    }

    // Maskable icons (solid background)
    for (const size of sizes.maskable) {
        const filename = `icon-maskable-${size}x${size}.png`;

        // Create base background
        const base = sharp({ create: { width: size, height: size, channels: 4, background: bg } });

        // Resize inner logo to 70% to ensure it fits comfortably in maskable safe zone
        const innerSize = Math.round(size * 0.7);
        const innerLogo = await sharp(logoBuffer).resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();

        await base.composite([{ input: innerLogo }]).png().toFile(path.join(iconsDir, filename));
    }

    console.log('Successfully regenerated all icons with seamless backgrounds!');
}

generate().catch(console.error);
