const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String },
  isInternalNote: { type: Boolean, default: false },
  attachments: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
