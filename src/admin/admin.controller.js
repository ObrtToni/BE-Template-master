const express = require('express');
const profilesService = require('../profiles/profiles.service');
const getProfile = require('../auth/getProfile.middleware');
const router = express.Router();

router.get('/best-profession', getProfile, async (req, res) => {
    const profession = await profilesService.getBestProfession(req.query.start, req.query.end);
    if(!profession) {
        return res.status(404).end();
    }
    return res.send(profession);
});

router.get('/best-clients', getProfile, async (req, res) => {
    return res.json(await profilesService.getBestClients(req.query.start, req.query.end, req.query.limit));
});

module.exports = router;