import * as express from "express";
import { handleAuthorization } from "../../middleware/JWT";
import { vacationRoutes } from "./routes";

const router = express.Router();

router.use(handleAuthorization)

vacationRoutes.forEach(route => {
    router[route.method](route.path, route.action);
})

export { router as vacationRouter }