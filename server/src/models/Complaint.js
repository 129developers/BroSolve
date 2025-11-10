const mongoose = require('mongoose');
const Counter = require('./Counter');

const LocationSchema = new mongoose.Schema({
  building: String,
  floor: String,
  room: String
}, { _id: false });

const ComplaintSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['Academics/Instructor','Facility/Infrastructure','IT/Systems','Admin/Support','Other'], default: 'Other' },
  priority: { type: String, enum: ['Low','Medium','High'], default: 'Low' },
  status: { type: String, enum: ['Submitted','In Progress','Awaiting Your Reply','Resolved','Closed'], default: 'Submitted' },
  location: LocationSchema,
  isAnonymous: { type: Boolean, default: false },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attachments: [{ type: String }],
  audioFiles: [{ type: String }],
  videoFiles: [{ type: String }],
  slaDeadline: { type: Date },
  resolvedAt: { type: Date },
  closedAt: { type: Date },
  meta: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

ComplaintSchema.pre('validate', async function(next) {
  if (!this.isNew || this.ticketId) return next();
  const result = await Counter.findOneAndUpdate(
    { _id: 'ticket' },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
  this.ticketId = `CMP-${date}-${String(result.seq).padStart(4, '0')}`;
  next();
});

ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ priority: 1 });
ComplaintSchema.index({ category: 1 });
ComplaintSchema.index({ student: 1 });
ComplaintSchema.index({ assignedTo: 1 });
ComplaintSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Complaint', ComplaintSchema);
