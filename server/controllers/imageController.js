// server/controllers/imageController.js
const path = require('path');
const fs = require('fs');

async function uploadImage(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate extension
    const allowedExt = ['.png', '.jpg', '.jpeg', '.gif'];
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!allowedExt.includes(ext)) {
      return res.status(400).json({ message: 'Invalid file type' });
    }

    // Generate secure filename
    const fileName = `${req.user.id}-${Date.now()}${ext}`;
    const uploadPath = path.join(__dirname, '../uploads', fileName);

    // Move file from temp to destination
    fs.rename(req.file.path, uploadPath, err => {
      if (err) return next(err);
      res.status(200).json({ url: `/uploads/${fileName}` });
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadImage };
