import { Router } from "express";
import { handleAuthorization } from "../../middleware/JWT";
import { adminOnly } from "../../middleware/UserMiddlewares";
import { userAdminRoutes } from "./userRoutes";
import { vacationAdminRoutes } from "./vacationRoutes";

const router = Router();

router.use(handleAuthorization)
router.use(adminOnly)

const userRouter = Router();

userAdminRoutes.forEach(route => {
    userRouter[route.method](route.path, route.action)
})

const vacationRouter = Router();

vacationAdminRoutes.forEach(route => {
    vacationRouter[route.method](route.path, route.action)
})

router.use('/users', userRouter)
router.use('/vacations', vacationRouter)

export { router as adminRouter}
