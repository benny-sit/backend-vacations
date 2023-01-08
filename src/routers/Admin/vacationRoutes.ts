import { Response, Request, NextFunction } from "express";
import { AppDataSource } from "../../data-source";
import { Vacation } from "../../entity/Vacation";
import { unlink } from 'node:fs/promises';

const vacationRepo = AppDataSource.getRepository(Vacation);

async function createVacation(req: Request, res: Response, next: NextFunction) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }


    const data = req.body;
    const vacImg = req.files.image instanceof Array ? req.files.image[0] : req.files.image;

    let updatedName = `${Date.now().toString()}-${vacImg.name}`

    let uploadPath =`${__dirname}/../../../public/vacation_images/${updatedName}`;

    vacImg.mv(uploadPath, function (err) {
        if (err)
            return res.status(500).json(err);
    });

    data.imageUrl = process.env.PUBLIC_IMAGES + updatedName;

    let ans;
    try {
        ans = await vacationRepo.insert(data);
    } catch (error) {
        return res.status(400).json({ error: error.sqlMessage});
    }


    return res.status(201).json(ans.identifiers);
}

async function updateVacation(req: Request, res: Response, next: NextFunction) {
    const {id:_, ...data} = req.body;
    const id = +req.params.id;

    let toDelete;
    let vacation;
    try {
        vacation = await vacationRepo.findOne({
            where: { id: id}
        })
    } catch (error) {
        return res.status(400).json({ error: error.sqlMessage});
    }


    if(!id) {
        return res.status(400).json({ error: "Id needs to be a number." });
    }

    if (req.files && Object.keys(req.files).length !== 0) {
        const vacImg = req.files.image instanceof Array ? req.files.image[0] : req.files.image;

        let updatedName = `${Date.now().toString()}-${vacImg.name}`

        let uploadPath =`${__dirname}/../../../public/vacation_images/${updatedName}`;

        vacImg.mv(uploadPath, function (err) {
            if (err)
                return res.status(500).json(err);
        });

        data.imageUrl = process.env.PUBLIC_IMAGES + updatedName;

        // delete image

        toDelete = __dirname + '/../../../' +  vacation.imageUrl;


    }

    try {
        await vacationRepo.save({...vacation, ...data});
        if(toDelete) {
            await unlink(toDelete);
        }
    } catch (error) {
        return res.status(400).json({ error: "couldn't save vacation"})
    }

    return res.json({id})
}

async function deleteVacation(req: Request, res: Response, next: NextFunction) {
    const id = +req.params.id;
    if(!id) {
        console.log(id);
        return res.status(400).json({ error: "Id needs to be a number"});
    }

    let vacation;
    try {
        vacation = await vacationRepo.findOne({
            where: { id: id},
            select: {
                imageUrl: true,
            }
        })
    } catch (error) {
        return res.status(400).json({ error: error.sqlMessage});
    }

    // delete image

    const toDelete = __dirname + '/../../../' +  vacation.imageUrl

    let ans;
    try {
        ans = await vacationRepo.delete(id);
        await unlink(toDelete)
    } catch (error) {
        return res.status(400).json({ error: "Could not delete"})
    }

    return res.json(ans);
}

export const vacationAdminRoutes = [
    {
        method: 'post',
        path: '/',
        action: createVacation
    },
    {
        method: 'delete',
        path: '/:id',
        action: deleteVacation
    },
    {
        method: 'put',
        path: '/:id',
        action: updateVacation
    }
]