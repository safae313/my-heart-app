const prestRepo = require('../repositories/prestataireRepository');

class PrestataireService {
    async list() { return await prestRepo.listAll(); }
    async get(id) { return await prestRepo.findById(id); }
    async create(data) { return await prestRepo.create(data); }
    async update(id, data) { return await prestRepo.update(id, data); }
    // simulate webhook handling later
}

module.exports = new PrestataireService();