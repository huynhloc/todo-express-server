import express from 'express'
import { getTasks, getTask, createTask, deleteTask, updateTask } from '../../services/taskService'

const api = express.Router()

api.get('/', getTasks)
api.post('/', createTask)
api.get('/:taskId', getTask)
api.put('/:taskId', updateTask)
api.delete('/:taskId', deleteTask)

export default api