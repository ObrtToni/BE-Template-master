const { Profile, Contract, Job } = require('../model');
const jobsService = require('../jobs/jobs.service');
const { sequelize } = require('../model');
const { Op } = require('sequelize');

async function getProfile(profileId, transaction) {
    return await Profile.findOne({ where: { id: profileId }, transaction });
}

async function updateProfileBalance(profileId, balance, transaction) {
    return await Profile.update({ balance }, { where: { id: profileId }, transaction })
}

async function depositProfileBalance(profileId, toDeposit) {
    try {
        return await sequelize.transaction(async (transaction) => {
            const unpaidJobs = await jobsService.getUnpaidJobs(profileId, transaction)
            const toPay = unpaidJobs.reduce((total, job) => (total + job.price), 0);
            if (toDeposit > (toPay / 4)) {
                throw new Error(400);
            }
            const currentBalance = (await getProfile(profileId, transaction)).balance || 0;
            const newBalance = currentBalance + toDeposit;
            await updateProfileBalance(profileId, newBalance, transaction)
            return 200;
        });
    } catch (e) {
        return Number(e.message) || 500;
    }
}

async function getBestProfession(startDate, endDate) {
    const profile = (await Profile.findAll({
        include: {
            model: Contract,
            as: 'Contractor',
            include: {
                model: Job,
            }
        },
        attributes: ['profession'],
        group: 'profession',
        order: [
            [sequelize.fn('sum', sequelize.col('Contractor.Jobs.price')), 'DESC']
        ],
        where: {
            ['$Contractor.Jobs.paid$']: true,
            ['$Contractor.Jobs.paymentDate$']: {
                [Op.between]: [startDate, endDate]
            }
        }
    }))[0];
    return profile?.profession;
}

async function getBestClients(startDate, endDate, limit) {
    return (await Profile.findAll({
        limit: Number(limit) || 2,
        subQuery: false,
        include: {
            model: Contract,
            as: 'Client',
            include: {
                model: Job,
            }
        },
        attributes: ['Profile.id', [sequelize.literal("firstName || ' ' || lastName"), 'fullName'], [sequelize.fn('sum', sequelize.col('Client.Jobs.price')), 'paid']],
        group: ['Profile.id', 'fullName', 'paid'],
        order: [['paid', 'DESC']],
        where: {
            ['$Client.Jobs.paid$']: true,
            ['$Client.Jobs.paymentDate$']: {
                [Op.between]: [startDate, endDate]
            }
        }
    }));
}

module.exports = { getProfile, updateProfileBalance, depositProfileBalance, getBestProfession, getBestClients };