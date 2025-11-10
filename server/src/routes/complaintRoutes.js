const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { auth } = require('../middleware/auth');
const { createComplaint, getComplaintById, updateComplaint } = require('../controllers/complaintController');

// student creates complaint
router.post('/', auth, upload.fields([{ name: 'attachments' }, { name: 'audioFiles' }, { name: 'videoFiles' }]), createComplaint);
router.get('/', auth, async (req, res) => {
  // simple list: students see own complaints, staff/admin see all (basic)
  const Complaint = require('../models/Complaint');
  const q = {};
  if (req.user.role === 'student') q.student = req.user.id;
  try {
    const complaints = await Complaint.find(q).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ data: complaints });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/:ticketId', auth, getComplaintById);
router.put('/:ticketId', auth, updateComplaint);
router.post('/:ticketId/comments', auth, async (req, res) => {
  const { ticketId } = req.params;
  const { text, isInternalNote } = req.body;
  try {
    const Complaint = require('../models/Complaint');
    const complaint = await Complaint.findOne({ ticketId });
    if (!complaint) return res.status(404).json({ error: 'Not found' });
    if (isInternalNote && !['staff','admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    const Comment = require('../models/Comment');
    const comment = await Comment.create({ complaint: complaint._id, user: req.user.id, text, isInternalNote: !!isInternalNote });
    // notify via sockets
    const io = req.app.get('io');
    if (io) {
      if (complaint.student) io.to(`student_${complaint.student.toString()}`).emit('new_comment', { ticketId, text });
      if (complaint.assignedTo) io.to(`staff_${complaint.assignedTo.toString()}`).emit('new_comment', { ticketId, text });
    }
    res.status(201).json({ data: comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
