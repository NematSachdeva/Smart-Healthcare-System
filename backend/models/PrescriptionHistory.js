const mongoose = require('mongoose');

const prescriptionHistorySchema = new mongoose.Schema({
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: [true, 'Prescription ID is required']
  },
  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Editor ID is required']
  },
  editedAt: {
    type: Date,
    default: Date.now
  },
  oldVersion: {
    type: String,
    required: [true, 'Old version is required']
  },
  newVersion: {
    type: String,
    required: [true, 'New version is required']
  },
  versionNumber: {
    type: Number,
    required: [true, 'Version number is required']
  },
  changeDescription: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
prescriptionHistorySchema.index({ prescriptionId: 1, editedAt: -1 });

const PrescriptionHistory = mongoose.model('PrescriptionHistory', prescriptionHistorySchema);

module.exports = PrescriptionHistory;
