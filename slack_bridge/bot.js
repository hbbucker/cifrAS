/**
 * Slack Bridge Entrypoint (Clean Architecture)
 */
const { bootstrap } = require('./src/infrastructure/bootstrap');

if (require.main === module) {
  bootstrap().catch((error) => {
    console.error('Fatal error starting Slack Bridge:', error);
    process.exit(1);
  });
}

module.exports = { bootstrap };
