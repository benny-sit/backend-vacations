import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserDetails } from "./UserDetails";

@Entity()
export class Vacation {
    @PrimaryGeneratedColumn()
    id : number

    @Column()
    destination : string

    @Column({
        length: 1024,
    })
    description : string

    @Column()
    startDate : Date

    @Column()
    endDate : Date

    @Column()
    price : number

    @ManyToMany(() => UserDetails, (userdetails) => userdetails.vacations, { onDelete: 'CASCADE'})
    subscribers : UserDetails[]

    @Column()
    imageUrl: string


}