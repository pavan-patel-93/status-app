import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  status: {
    type: String,
    enum: ['operational', 'degraded_performance', 'partial_outage', 'major_outage'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

statusHistorySchema.index({ serviceId: 1, timestamp: -1 });

export const StatusHistory = mongoose.models.StatusHistory || mongoose.model('StatusHistory', statusHistorySchema); 