import multer from 'multer';

// Memory storage for file uploads
const storage = multer.memoryStorage();

// Multer configuration for Excel files
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Faqat Excel fayllari qabul qilinadi (.xlsx, .xls)'));
    }
  },
});
