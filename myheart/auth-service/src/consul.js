const Consul = require('consul');

const consul = new Consul({
  host: process.env.CONSUL_HOST || 'consul',
  port: process.env.CONSUL_PORT || 8500,
  promisify: true
});

const registerToConsul = async (serviceName, port) => {
  try {
    await consul.agent.service.register({
      name: serviceName,
      address: serviceName,
      port: port,
      check: {
        http: `http://${serviceName}:${port}/health`,
        interval: '10s',
        timeout: '5s'
      }
    });
    console.log(`✅ ${serviceName} enregistré dans Consul`);
  } catch (err) {
    console.error(`❌ Erreur Consul: ${err.message}`);
  }
};

module.exports = { registerToConsul };