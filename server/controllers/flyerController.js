// server/controllers/flyerController.js
const Flyer = require('../data/Flyer');

// Assumes verifyJWT middleware populates req.user
async function createFlyer(req, res, next) {
  try {
    // Authorization: only users with role 'admin' can create flyers
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: insufficient privileges' });
    }

    const { title, description, imageUrl } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const flyer = new Flyer({ title, description, imageUrl, createdBy: req.user.id });
    const saved = await flyer.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
}

module.exports = { createFlyer };
