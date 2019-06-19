import mongoose from 'mongoose'
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  done: { type: Boolean, default: false },
  flg: { type: Number, default: 1 }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export default mongoose.model('Task', TaskSchema)
