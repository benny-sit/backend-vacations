import { Router } from "express";
import { handleAuthorization } from "../../middleware/JWT";
import { userRoutes, verifyUser } from "./routes";


const router = Router();

userRoutes.forEach(route => {
    router[route.method](route.path, route.action)
})

router.post('/verify', handleAuthorization, verifyUser)

export { router as userRouter};