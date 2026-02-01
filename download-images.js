import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define images and their source URLs
const images = [
  { filename: 'everest.jpg', url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1200' },
  { filename: 'boudhanath.jpg', url: 'https://images.unsplash.com/photo-1542662565-7e4b66bae529?auto=format&fit=crop&q=80&w=1200' },
  { filename: 'pokhara.jpg', url: 'https://images.unsplash.com/photo-1546853899-709e50423661?auto=format&fit=crop&q=80&w=1200' },
  { filename: 'annapurna.jpg', url: 'https://images.unsplash.com/photo-1590606086785-304e225439cb?auto=format&fit=crop&q=80&w=1200' },
  { filename: 'bhaktapur.jpg', url: 'https://images.unsplash.com/photo-1596525712437-080c950294da?auto=format&fit=crop&q=80&w=1200' },
  { filename: 'chitwan.jpg', url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=1200' }
];

const assetsDir = path.join(__dirname, 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Download function
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const stream = fs.createWriteStream(filepath);
        res.pipe(stream);
        stream.on('finish', () => {
          stream.close();
          console.log(`Downloaded: ${path.basename(filepath)}`);
          resolve();
        });
      } else {
        res.consume();
        reject(new Error(`Failed to download ${url}, status code: ${res.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
};

// Execute downloads
(async () => {
  console.log('Starting image downloads...');
  for (const img of images) {
    try {
      await downloadImage(img.url, path.join(assetsDir, img.filename));
    } catch (err) {
      console.error(`Error downloading ${img.filename}:`, err.message);
    }
  }
  console.log('All downloads completed!');
})();