import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId:  { type: String, required: true, unique: true },
  sender:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration:   { type: Number, required: true }, // minutes
  expiresAt:  { type: Date, required: true },
  active:     { type: Boolean, default: true },
  lastLocation: {
    lat: Number,
    lng: Number,
    timestamp: Date,
  },
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);