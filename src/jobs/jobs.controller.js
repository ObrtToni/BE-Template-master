const express = require('express');
const getProfile = require('../auth/getProfile.middleware');
const jobsService = require('./jobs.service');

const router = express.Router();

router.get('/unpaid', getProfile, async (req, res) => {
    res.json(await jobsService.getUnpaidJobs(req.profile.id));
});

router.post('/:job_id/pay', getProfile, async (req, res) => {
    return res.status(await jobsService.payJob(req.params.job_id, req.profile.id)).end();
});

module.exports = router;