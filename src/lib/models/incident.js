import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['investigating', 'identified', 'monitoring', 'resolved'],
    default: 'investigating'
  },
  impact: {
    type: String,
    enum: ['none', 'minor', 'major', 'critical'],
    default: 'none'
  },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  createdBy: { type: String, required: true },
  updates: [{
    message: String,
    status: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Incident = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);