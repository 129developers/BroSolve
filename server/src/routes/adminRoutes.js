const express = require('express');
const router = express.Router();
const { auth, permit } = require('../middleware/auth');

// Admin: list users (simple)
router.get('/users', auth, permit('admin'), async (req, res) => {
  const User = require('../models/User');
  const users = await User.find().select('-password').lean();
  res.json({ data: users });
});

router.put('/complaints/:ticketId', auth, permit('admin','staff'), async (req, res) => {
  const controller = require('../controllers/complaintController');
  return controller.updateComplaint(req, res);
});

module.exports = router;
