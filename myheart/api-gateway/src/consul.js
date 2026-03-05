const Consul = require('consul');

const consul = new Consul({
  host: process.env.CONSUL_HOST || 'consul',
  port: process.env.CONSUL_PORT || 8500,
  promisify: true
});

// Enregistrer un service dans Consul
const registerService = async (name, port) => {
  try {
    await consul.agent.service.register({
      name,
      address: name,
      port,
      check: {
        http: `http://${name}:${port}/health`,
        interval: '10s',
        timeout: '5s'
      }
    });
    console.log(`✅ ${name} enregistré dans Consul`);
  } catch (err) {
    console.error(`❌ Erreur enregistrement Consul: ${err.message}`);
  }
};

// Découvrir un service depuis Consul
const discoverService = async (name) => {
  try {
    const result = await consul.health.service({
      service: name,
      passing: true
    });
    if (result[0].length === 0) throw new Error(`Service ${name} non trouvé`);
    const service = result[0][0].Service;
    return `http://${service.Address}:${service.Port}`;
  } catch (err) {
    console.error(`❌ Erreur découverte service: ${err.message}`);
    return null;
  }
};

module.exports = { consul, registerService, discoverService };