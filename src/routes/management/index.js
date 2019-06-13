import express from 'express'
import taskRoutes from './task'

const api = express.Router()

api.get('/', (req, res) => {
  res.status(200).send('Todo APIs for management')
})

api.use('/coupons', taskRoutes)

// api.use(aclStore.manAcl.middleware.errorHandler('json'))
api.use((err, req, res, next) => {
  if (err.name !== 'HttpError' || !err.errorCode) return next(err)
  res.status(err.errorCode).json({ errors: { common: err.message } })
})

export default api