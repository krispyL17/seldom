import { loadSearchConfig, startSearchServer } from './http/server.js'

startSearchServer(loadSearchConfig())
