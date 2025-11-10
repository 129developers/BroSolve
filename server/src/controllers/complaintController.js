const Complaint = require('../models/Complaint');
const Comment = require('../models/Comment');

const mapFilesToUrls = (filesArray) => (filesArray || []).map(f => f.location || f.path || f.filename || f.originalname);

const createComplaint = async (req, res) => {
  try {
    const {
      title, description, category, priority, isAnonymous,
      building, floor, room
    } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const attachments = mapFilesToUrls(req.files?.attachments);
    const audioFiles = mapFilesToUrls(req.files?.audioFiles);
    const videoFiles = mapFilesToUrls(req.files?.videoFiles);

    const complaint = new Complaint({
      title,
      description,
      category,
      priority,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      location: { building, floor, room },
      attachments,
      audioFiles,
      videoFiles,
      student: req.user.id
    });

    if (complaint.priority === 'High') {
      complaint.slaDeadline = new Date(Date.now() + 1000 * 60 * 60 * 24);
    } else {
      complaint.slaDeadline = new Date(Date.now() + 1000 * 60 * 60 * 72);
    }

    await complaint.save();

    const io = req.app.get('io');
    if (io) {
      if (complaint.assignedTo) {
        io.to(`staff_${complaint.assignedTo.toString()}`).emit('ticket_assigned', { ticketId: complaint.ticketId });
      } else {
        io.to('admins').emit('new_ticket', { ticketId: complaint.ticketId, priority: complaint.priority });
      }
    }

    return res.status(201).json({ data: complaint });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const complaint = await Complaint.findOne({ ticketId })
      .populate('student', 'name email role')
      .populate('assignedTo', 'name email role')
      .lean();
    if (!complaint) return res.status(404).json({ error: 'Not found' });

    if (complaint.isAnonymous) {
      const reqRole = req.user.role;
      const isOwner = req.user.id === (complaint.student && String(complaint.student._id));
      if (!(reqRole === 'admin' || isOwner)) {
        complaint.student = { name: 'Anonymous' };
      }
    }

    let comments = await Comment.find({ complaint: complaint._id }).populate('user', 'name role').sort('createdAt').lean();
    if (req.user.role === 'student') {
      comments = comments.filter(c => !c.isInternalNote);
    }

    return res.json({ data: { complaint, comments } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const updateComplaint = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, assignedTo, priority, addInternalNote } = req.body;

    const complaint = await Complaint.findOne({ ticketId });
    if (!complaint) return res.status(404).json({ error: 'Not found' });

    if (status) complaint.status = status;
    if (priority) complaint.priority = priority;
    if (assignedTo) complaint.assignedTo = assignedTo;

    if (status === 'Resolved') complaint.resolvedAt = new Date();
    if (status === 'Closed') complaint.closedAt = new Date();

    await complaint.save();

    if (addInternalNote && addInternalNote.text) {
      await Comment.create({
        complaint: complaint._id,
        user: req.user.id,
        text: addInternalNote.text,
        isInternalNote: true
      });
    }

    const io = req.app.get('io');
    if (io) {
      if (assignedTo) io.to(`staff_${assignedTo}`).emit('ticket_assigned', { ticketId });
      if (complaint.student) io.to(`student_${complaint.student.toString()}`).emit('ticket_updated', { ticketId, status: complaint.status });
    }

    return res.json({ data: complaint });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createComplaint, getComplaintById, updateComplaint };
