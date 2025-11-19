import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true }, // Appetizers, Main Course, etc.
  image: { type: String },
  isAvailable: { type: Boolean, default: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // from user-service later
}, { timestamps: true });

export default mongoose.model('MenuItem', menuItemSchema);