const Consul = require('consul');

const consul = new Consul({
  host: process.env.CONSUL_HOST || 'localhost',
  port: process.env.CONSUL_PORT || 8500,
  promisify: true
});

const registerToConsul = async (serviceName, port) => {
  try {
    await consul.agent.service.register({
      name: serviceName,
      address:  'localhost',
      port: port,
      check: {
        http: `http://localhost:${port}/health`,
        interval: '30s',
        timeout: '10s',
        deregisterCriticalServiceAfter: '1m'
        }
    });
    console.log(`✅ ${serviceName} enregistré dans Consul`);
  } catch (err) {
    console.error(`❌ Erreur Consul: ${err.message}`);
  }
};

module.exports = { registerToConsul };