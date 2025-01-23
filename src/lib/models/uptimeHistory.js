import mongoose from 'mongoose';

const uptimeHistorySchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  isUp: {
    type: Boolean,
    required: true
  },
  status: {
    type: String,
    enum: ['operational', 'degraded_performance', 'partial_outage', 'major_outage'],
    required: true
  }
});

uptimeHistorySchema.index({ serviceId: 1, timestamp: -1 });

export const UptimeHistory = mongoose.models.UptimeHistory || mongoose.model('UptimeHistory', uptimeHistorySchema); 