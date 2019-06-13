import express from 'express'
import { getTasks, getTask, createTask, deleteTask } from '../../services/taskService'

const api = express.Router()

api.get('/', getTasks)
api.post('/', createTask)
api.get('/:taskId', getTask)
// api.put('/:couponId', updateTask)
api.delete('/:taskId', deleteTask)

export default api