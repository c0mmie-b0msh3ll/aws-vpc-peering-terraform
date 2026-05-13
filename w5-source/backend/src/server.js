import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import exitHook from 'async-exit-hook'
import http from 'http'
import { corsOptions } from '~/config/cors'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { INIT_INDEXES } from '~/config/indexes'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1/_index.route'
import { errorHandlingMiddleware } from '~/middlewares/errorHandling.middleware'
import { CONNECT_REDIS_CACHE, CLOSE_REDIS_CACHE } from '~/config/redisCache'
import {
  CONNECT_REDIS_REALTIME,
  CLOSE_REDIS_REALTIME
} from '~/config/redisRealtime'
import { INIT_SOCKET } from './config/socket'

const START_SERVER = async () => {
  const app = express()

  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // CORS
  app.use(cors(corsOptions))

  // Cookie parser
  app.use(cookieParser())

  // Parse JSON body
  app.use(express.json())

  // APIs V1
  app.use('/api/v1', APIs_V1)

  app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ ok: true })
  })

  // Error handling middleware
  app.use(errorHandlingMiddleware)

  // Tạo HTTP server bọc app Express
  const server = http.createServer(app)

  // Khởi tạo Socket.IO + Redis adapter
  await INIT_SOCKET(server)

  // Start server
  if (env.BUILD_MODE === 'production') {
    server.listen(process.env.PORT, () => {
      console.log(
        `4. Production: Hi ${env.AUTHOR}, Back-end Server is running successfully at Port: ${process.env.PORT}`
      )
    })
  } else {
    server.listen(8017, '0.0.0.0', () => {
      console.log(
        `4. Local DEV: Hi ${env.AUTHOR}, Back-end Server is running successfully at Host: ${env.LOCAL_DEV_APP_HOST} and Port: ${env.LOCAL_DEV_APP_PORT}`
      )
    })
  }

  // Cleanup
  exitHook(async () => {
    console.log('5. Server is shutting down...')

    await CLOSE_REDIS_CACHE()
    console.log('6. Disconnected Redis cache.')

    await CLOSE_REDIS_REALTIME()
    console.log('7. Disconnected Redis realtime.')

    await CLOSE_DB()
    console.log('8. Disconnected from MongoDB Cloud Atlas.')
  })
}

// IIFE
;(async () => {
  try {
    console.log(process.env.MONGODB_URI)

    console.log('1. Connecting to MongoDB Cloud Atlas...')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB Cloud Atlas!')

    console.log('2.1 Creating database indexes...')
    await INIT_INDEXES()
    console.log('2.2 Database indexes ready!')

    console.log('3. Connecting Redis cache...')
    await CONNECT_REDIS_CACHE()
    console.log('3.1 Connected Redis cache successfully!')

    console.log('3.2 Connecting Redis realtime...')
    await CONNECT_REDIS_REALTIME()
    console.log('3.3 Connected Redis realtime successfully!')

    await START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()
