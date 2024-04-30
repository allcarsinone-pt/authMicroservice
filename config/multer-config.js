const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: './src/static/profile',
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

// Init upload

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images only!');
  }
}
const upload = multer({
    storage: storage,
    limits: {fileSize: 1000000}, // limit file size if needed
    fileFilter: function(req, file, cb) {
      checkFileType(file, cb);
    }
  }).single('myImage');

  
module.exports = upload