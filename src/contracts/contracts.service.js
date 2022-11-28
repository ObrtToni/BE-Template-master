const { Contract } = require('../model');
const { Op } = require("sequelize");


async function getContract(contractId, profileId) {
    return await Contract.findOne({
        where: {
            id: contractId,
            [Op.or]: [
                { clientId: profileId },
                { contractorId: profileId },
            ]
        }
    });
};

async function getContracts(profileId) {
    return await Contract.findAll({
        where: {
            status: {
                [Op.not]: 'terminated'
            },
            [Op.or]: [
                { clientId: profileId },
                { contractorId: profileId },
            ]
        }
    });
};

module.exports = { getContract, getContracts };