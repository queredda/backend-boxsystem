import fs from 'fs';
import path from 'path';

const rootDir = path.resolve(__dirname, '..');

const createDirectories = () => {
  if (process.env.NODE_ENV === 'production') return;
  const directories = ['logs', '../dist'];

  directories.forEach((dir) => {
    const fullPath = path.join(rootDir, dir);
    try {
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Directory created successfully: ${fullPath}`);
      }
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
    }
  });
};

export default createDirectories;
