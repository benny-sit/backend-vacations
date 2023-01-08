import { NextFunction, Response, Request } from "express";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { Vacation } from "../../entity/Vacation";
import { tokenize, verifyToken } from "../../middleware/JWT";

const vacationRepo = AppDataSource.getRepository(Vacation);
const userRepo = AppDataSource.getRepository(User);

async function getVacations(req: Request, res: Response, next: NextFunction) {
    let perPage = req.body.perPage === undefined ? 10 : req.body.perPage;
    let page = req.body.page === undefined ? 1 : req.body.page;
    if (perPage > 50) {
        return res.status(400).json({ error: "Page is too long" });
    }

    const [result, total] = await vacationRepo.findAndCount({
        take: perPage,
        skip: perPage * (page-1)
    })

    return res.json({result: result, count: total});
}



async function userVacations(req: Request, res: Response, next: NextFunction) {
    const userId = req.body.user.userId;

    let userWithVacations;
    try {
        userWithVacations = await userRepo.findOne({
            where: {
                id: userId
            },
            relations: {
                userDetails: {
                    vacations: true,
                }
            },
        })
    } catch (err) {
        return res.status(404).send({error: "Proble querying DB"});
    }
    console.log(userWithVacations);

    return res.status(200).json(userWithVacations.userDetails.vacations)
}

async function followVacation(req: Request, res: Response, next: NextFunction) {
    const userId = req.body.user.userId;
    const vacationId = req.body.vacationId;

    if (!vacationId) {
        return res.status(400).json({error: "Missing vacation ID"});
    }

    let user
    try {
        let vacation = await vacationRepo.findOneBy({ id: vacationId});
        user = await userRepo.findOne({ 
            where: {
                id: userId,
            },
            relations: {
                userDetails:{
                    vacations: true
                },
            }
        })
        user.userDetails.vacations.push(vacation);
        console.log(user);
        await userRepo.save(user);
    } catch (err) {
        return res.status(404).send({error: "Problem querying DB"});
    }


    return res.status(200).json({ vacationId })
}

async function unFollowVacation(req: Request, res: Response, next: NextFunction) {
    const userId = req.body.user.userId;
    const vacationId = req.body.vacationId;

    if (!vacationId) {
        return res.status(400).json({error: "Missing vacation ID"});
    }

    let user;

    try {
        user = await userRepo.findOne({ 
            where: {
                id: userId,
            },
            relations: {
                userDetails:{
                    vacations: true
                },
            }
        })

        user.userDetails.vacations = user.userDetails.vacations.filter(v => v.id !== vacationId);

        await userRepo.save(user)
    } catch (error) {
        return res.status(404).send({error: "Problem querying DB"});
    }

    return res.status(200).json({vacationId})
}


export const vacationRoutes = [
    {
        method: 'get',
        path: '/',
        action: getVacations
    },
    {
        method: 'get',
        path: '/my',
        action: userVacations
    },
    {
        method: 'post',
        path: '/follow',
        action: followVacation
    },
    {
        method: 'post',
        path: '/unfollow',
        action: unFollowVacation
    }
]