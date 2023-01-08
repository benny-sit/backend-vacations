import { Response, Request, NextFunction } from "express";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { UserDetails } from "../../entity/UserDetails";
import { tokenize } from "../../middleware/JWT";
const bcrypt = require("bcrypt");


const userRepo = AppDataSource.getRepository(User);
const userDetailsRepo = AppDataSource.getRepository(UserDetails);


async function login(req: Request, res: Response, next: NextFunction) {
    
    const { username, password, ...rest } = req.body;

    if (username === undefined || password === undefined) {
        return res.status(400).json({ error: "Not provided username or password"})
    }
    console.log("------------------- user login ----------------")
    let user;
    let match = false; 

    // Get the user
    try {
        user = await userRepo.findOne({
            where: {
                username: username
            },
            select: {
                id: true,
                username: true,
                password: true,
                userDetails: {
                    isAdmin: true
                }
            },
            relations: {
                userDetails: true
            }
        }, 
        )
        
    } catch (error) {
        return res.status(400).json({ error: error.sqlMessage });
    }
    if(!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    // Check the password
    match = await bcrypt.compare(password, user.password)
    
    if (!match) {
        return res.status(401).json({error: "wrong username or password"})
    }
    
    let token = tokenize({username, userId: user.id})
    res.set("Authorization", "Bearer " + token)
    const resJson = {
        token:token,
        isAdmin: user.userDetails.isAdmin,
        user: {userId: user.id, username: user.username}
    }
    return res.json(resJson);
}

async function register(req: Request, res: Response, next: NextFunction) {
    const data = req.body

    if (data.password === undefined || data.username === undefined || data.userDetails === undefined) {
        return res.status(400).json({ error: "Password and Username are required"})
    }

    if (data.password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters"})
    }

    data.userDetails.isAdmin = false;
    data.password = await bcrypt.hash(data.password, +process.env.SALT_ROUNDS || 10);

    let ans;
    try {
        await userDetailsRepo.insert(data.userDetails);
        ans = await userRepo.insert(data);
    } catch (error) {
        if (error.errno == 1062) {
            return res.status(400).json({error: "Username already occupied"})
        }
        return res.status(400).json({ error: error.sqlMessage});
    }

    let token = tokenize({username: data.username, userId: ans.identifiers[0].id})
    res.set("Authorization", "Bearer " + token)
    const resJson = {
        token: token,
        user: {userId: ans.identifiers[0].id,
        username: data.username}, isAdmin: false
    }

    return res.json(resJson);
}

export async function verifyUser(req: Request, res: Response, next: NextFunction) {
    if(req.body.user=== undefined) {
        return res.status(400).json({ error: "Username is required"})
    }

    let user;
    try {
        user = await userRepo.findOne({
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

    if(!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const resJson = {
        token: res.getHeaders().authorization.toString().split(' ')[1],
        user: {
            userId: req.body.user.userId,
            username: req.body.user.username
        },
        isAdmin: user.userDetails.isAdmin

    }
    return res.json(resJson);
}


export const userRoutes = [
    {
        method: 'post',
        path: '/login',
        action: login
    },
    {
        method: 'post',
        path: '/register',
        action: register
    }
]