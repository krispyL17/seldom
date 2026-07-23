import { DEFAULT_ANALYTICS_CONFIG } from '../../analytics/types.js'
import { startAnalyticsServer } from './http/server.js'

const port = Number(process.env.ANALYTICS_PORT ?? DEFAULT_ANALYTICS_CONFIG.port)

startAnalyticsServer(port)
