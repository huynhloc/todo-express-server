import mongoose from 'mongoose'
const TaskSchema = new mongoose.Schema({
  type: { type: String, required: true },
  flg: { type: Number, default: 1 }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export default mongoose.model('Task', TaskSchema)
