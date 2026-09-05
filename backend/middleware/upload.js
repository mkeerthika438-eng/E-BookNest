const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadRoot = path.join(__dirname, '..', 'uploads');

function storageFor(subfolder) {
  const dir = path.join(uploadRoot, subfolder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    }
  });
}

const imageFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
  else cb(new Error('Only JPG, PNG, or WEBP images are allowed for covers.'));
};

const pdfFilter = (req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() === '.pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed for e-books.'));
};

const uploadCover = multer({
  storage: storageFor('covers'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadEbook = multer({
  storage: storageFor('ebooks'),
  fileFilter: pdfFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

module.exports = { uploadCover, uploadEbook };
