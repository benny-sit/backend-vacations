import { Response, Request, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

const userRepo = AppDataSource.getRepository(User);


// Need to unwrap token before using this functions


export async function populateUser(req: Request, res: Response, next: NextFunction) {
    if(req.body.user === undefined) {
        return res.status(400).json({ error: "Username is required"})
    }

    let user;
    try {
        user = await userRepo.findOne({ 
            where: {
                username: req.body.user.username
            },
            relations: {
                userDetails: true
            }
        })
    } catch (error) {
        return res.status(400).json({ error: error.sqlMessage});
    }

    if (user === null || user === undefined) {
        return res.status(404).json({ error: "User not found"})
    }

    req.body.user = user;
    next();
}

export async function adminOnly(req: Request, res: Response, next: NextFunction) {
    if(req.body.user=== undefined) {
        return res.status(400).json({ error: "Username is required"})
    }

    let ans;
    try {
        ans = await userRepo.findOne({
            where: { username: req.body.user.username},
            relations : {
                userDetails: true
            },
            select: {
                userDetails: {
                    isAdmin: true
                }
            }
        })
    } catch (error) {
        return res.status(400).json({ error: error.sqlMessage});
    }

    if (!ans) {
        return res.status(404).json({ error: 'User not found' });
    }

    if(!ans.userDetails.isAdmin) {
        return res.status(401).json({ error: "Only admin is allowed" });
    }
    next();
}