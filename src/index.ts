import { AppDataSource } from "./data-source"
import { Response, Request, NextFunction } from "express"
import express from "express"
import cors from "cors"
import fileUpload from "express-fileupload";
import { userRouter } from "./routers/Users/router"
import { initAdmin } from "./db-init"
import { handleAuthorization, refreshSecretKey } from "./middleware/JWT"
import { vacationRouter } from "./routers/Vacations/router"
import { adminRouter } from "./routers/Admin/router"

const app = express()

var os = require('os');

var networkInterfaces = os.networkInterfaces();

console.log("Addr: ",networkInterfaces);


AppDataSource.initialize().then(async () => {

    initAdmin();
    refreshSecretKey();

    app.use(express.json());
    app.use(cors({
        origin: '*',
        exposedHeaders: ['Authorization']
    }));
    app.use(fileUpload({
        createParentPath: true,
        abortOnLimit: true,
        limits: {
            fileSize: 3000000
        }
    }))
    app.use('/public',express.static('public'))

    app.get('/', (req: Request, res: Response) => {
        return res.json({"msg": "Hello World!"}); // Health check
    });

    // routers
    app.use('/users', userRouter)
    app.use('/vacations', vacationRouter)

    app.use('/admin', adminRouter)




    app.listen(+process.env.PORT || 3001, '0.0.0.0', () => {
        console.log("listening on port " + process.env.SERVER_PORT || 3001);
    })

}).catch(error => console.log(error))
