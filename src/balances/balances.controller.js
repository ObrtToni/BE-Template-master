const express = require('express');
const getProfile = require('../auth/getProfile.middleware');
const profilesService = require('../profiles/profiles.service');

const router = express.Router();

router.post('/deposit/:userId', getProfile, async (req, res) => {
    return res.status(await profilesService.depositProfileBalance(req.params.userId, Number(req.body.deposit))).end();
});

module.exports = router;