const { Op } = require("sequelize");
const { Contract, Job, sequelize } = require('../model');

async function getUnpaidJobs(profileId, transaction) {
    return await Job.findAll({
        include: [{
            model: Contract,
        }],
        where: {
            paid: {
                [Op.not]: true,
            },
            '$Contract.status$': 'in_progress',
            [Op.or]: [
                { '$Contract.ClientId$': profileId },
                { '$Contract.ContractorId$': profileId },
            ]
        },
        transaction,
    });
};

async function payJob(jobId, profileId) {
    const profilesService = require('../profiles/profiles.service');

    try {
        return await sequelize.transaction(async (transaction) => {
            const job = await Job.findOne({
                include: [{
                    model: Contract,
                }],
                where: { id: jobId, '$Contract.ClientId$': profileId },
                transaction,
            });
    
            if (!job) throw new Error(404);
    
            const contractor = await profilesService.getProfile(job.Contract.ContractorId, transaction);
            const client = await profilesService.getProfile(profileId, transaction);
    
            if (!contractor) throw new Error(404);
    
            if (job.price > client.balance) throw new Error(400);
    
            await Promise.all([
                Job.update({ paid: true, paymentDate: new Date() }, { where: { id: jobId }, transaction }),
                profilesService.updateProfileBalance(profileId, client.balance - job.price, transaction),
                profilesService.updateProfileBalance(contractor.id, contractor.balance + job.price, transaction),
            ]);
    
            return 200;
        });
    }catch(e) {
        return Number(e.message) || 500;
    }
    
};

module.exports = { getUnpaidJobs, payJob };