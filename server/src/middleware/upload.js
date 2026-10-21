const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with sanitized unique filenames
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${cleanOriginalName}`);
  },
});

// Allowed file types: images and standard documents only
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const fileFilter = (req, file, cb) => {
  // Check extension against blacklisted executable types
  const ext = path.extname(file.originalname).toLowerCase();
  const dangerousExtensions = ['.exe', '.bat', '.sh', '.js', '.vbs', '.msi', '.cmd', '.ps1', '.html', '.php'];

  if (dangerousExtensions.includes(ext)) {
    return cb(new Error('Executable and script file uploads are strictly prohibited.'), false);
  }

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Allowed formats: JPG, PNG, WEBP, GIF, PDF, DOC, DOCX, TXT.'),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB limit
    files: 5, // Maximum 5 files per complaint
  },
  fileFilter: fileFilter,
});

module.exports = upload;
