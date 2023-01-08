import { Response, Request, NextFunction } from "express";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User"; 

const userRepo = AppDataSource.getRepository(User);

async function getAllUsers(req: Request, res: Response, next: NextFunction) {
    const users = await userRepo.find({});

    return res.json(users)
}


export const userAdminRoutes = [
    {
        method: 'get',
        path: '/all',
        action: getAllUsers
    },
]