/**
 * APIs for client application
 */

import express from 'express'
import taskRoutes from './task'

const api = express.Router()

api.get('/', (req, res) => {
  res.status(200).send('Todo APIs for application')
})

api.use('/tasks', taskRoutes)

export default api