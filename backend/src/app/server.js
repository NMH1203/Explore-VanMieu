import { createConfig } from '../config/index.js';
import { createApplication } from './index.js';
const config = createConfig();
const { server, db } = createApplication(config);
server.listen(config.port, config.host, () => {
  console.log(`Explore Van Mieu: http://localhost:${config.port}`);
  console.log(`Database: ${config.databasePath}`);
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? 'Cong dang duoc su dung. Doi PORT va APP_ORIGIN trong .env.' : error.message); db.close(); process.exitCode = 1; });
let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  server.close(() => { db.close(); });
  const timeout = setTimeout(() => server.closeAllConnections(), 5000);
  timeout.unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
