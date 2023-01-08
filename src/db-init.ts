import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { UserDetails } from "./entity/UserDetails";
const bcrypt = require("bcrypt");

const userRepo = AppDataSource.getRepository(User);

export const initAdmin = async () => {
    const users = await userRepo.find({});
    if(users.length == 0 ) {
        const userDetails = new UserDetails();
        userDetails.firstName = "John";
        userDetails.lastName = "Doe";
        userDetails.isAdmin = true;
        userDetails.email = "admin@example.com";
        await AppDataSource.manager.save(userDetails);
    
        const user = new User();
        user.username = 'admin';
        user.password = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'password', +process.env.SALT_ROUNDS || 10);
        user.userDetails = userDetails;
        await AppDataSource.manager.save(user);
    }
};

