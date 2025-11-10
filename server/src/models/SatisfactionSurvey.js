const mongoose = require('mongoose');

const SatisfactionSurveySchema = new mongoose.Schema({
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true, unique: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  feedback: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('SatisfactionSurvey', SatisfactionSurveySchema);
