const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'images');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles(directoryPath);

allFiles.forEach(async (file) => {
  const ext = path.extname(file).toLowerCase();
  
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    console.log(`Optimizing: ${file}`);
    
    try {
      const buffer = await fs.promises.readFile(file);
      const metadata = await sharp(buffer).metadata();
      
      let pipeline = sharp(buffer);

      // Resize if too large
      if (metadata.width > 1920) {
        pipeline = pipeline.resize({ width: 1920 });
      }

      if (ext === '.png') {
        pipeline = pipeline.png({ quality: 80, compressionLevel: 9, palette: true });
      } else if (ext === '.jpg' || ext === '.jpeg') {
        pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
      }

      const outputBuffer = await pipeline.toBuffer();
      
      await fs.promises.writeFile(file, outputBuffer);
      console.log(`Optimized: ${file}`);
    } catch (err) {
      console.error(`Error optimizing ${file}:`, err);
    }
  }
});
