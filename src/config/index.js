
import development from './development'
import staging from './staging'
import production from './production'

export default {
  development: development,
  staging: staging,
  production: production,
}[process.env.NODE_ENV || 'development']