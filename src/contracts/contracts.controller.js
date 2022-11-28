const express = require('express');
const contractsService = require('./contracts.service');
const getProfile = require('../auth/getProfile.middleware');

const router = express.Router();

router.get('/', getProfile, async(req, res) => {
    res.json(await contractsService.getContracts(req.profile.id));
});

router.get('/:id',getProfile ,async (req, res) =>{
    const contract = await contractsService.getContract(req.params.id, req.profile.id);
    if(!contract) {
        return res.status(404).end();
    }
    res.json(contract);
})

module.exports = router;