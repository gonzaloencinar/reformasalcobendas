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

(async () => {
  for (const file of allFiles) {
    const ext = path.extname(file).toLowerCase();
    
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      console.log(`Converting to WebP: ${file}`);
      
      try {
        const buffer = await fs.promises.readFile(file);
        const metadata = await sharp(buffer).metadata();
        
        let pipeline = sharp(buffer);

        // Resize if too large
        if (metadata.width > 1920) {
          pipeline = pipeline.resize({ width: 1920 });
        }

        pipeline = pipeline.webp({ quality: 80 });

        const newFilePath = file.replace(ext, '.webp');
        
        const outputBuffer = await pipeline.toBuffer();
        
        await fs.promises.writeFile(newFilePath, outputBuffer);
        console.log(`Generated: ${newFilePath}`);
        
        // Optionally delete original file if you want to enforce WebP only
        // await fs.promises.unlink(file); 
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }
  }
})();
