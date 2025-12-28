import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../');
const targetDir = path.join(projectRoot, 'public', 'mshel-oasis');

console.log(`Creating directory at: ${targetDir}`);

if (!fs.existsSync(targetDir)) {
    try {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log('Directory created successfully.');
    } catch (err) {
        console.error('Error creating directory:', err);
        process.exit(1);
    }
} else {
    console.log('Directory already exists.');
}

const sourceImages = [
    "C:/Users/user/.gemini/antigravity/brain/d9c2ee35-2b1c-4cc0-bede-7370a0c27bdd/uploaded_image_0_1766868523226.jpg",
    "C:/Users/user/.gemini/antigravity/brain/d9c2ee35-2b1c-4cc0-bede-7370a0c27bdd/uploaded_image_1_1766868523226.jpg",
    "C:/Users/user/.gemini/antigravity/brain/d9c2ee35-2b1c-4cc0-bede-7370a0c27bdd/uploaded_image_2_1766868523226.jpg",
    "C:/Users/user/.gemini/antigravity/brain/d9c2ee35-2b1c-4cc0-bede-7370a0c27bdd/uploaded_image_3_1766868523226.jpg",
    "C:/Users/user/.gemini/antigravity/brain/d9c2ee35-2b1c-4cc0-bede-7370a0c27bdd/uploaded_image_4_1766868523226.jpg"
];

sourceImages.forEach((src, index) => {
    const dest = path.join(targetDir, `image-${index}.jpg`);
    try {
        fs.copyFileSync(src, dest);
        console.log(`Copied ${src} to ${dest}`);
    } catch (err) {
        console.error(`Error copying ${src}:`, err);
    }
});
