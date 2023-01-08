import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserDetails } from "./UserDetails";

@Entity()
export class Vacation {
    @PrimaryGeneratedColumn()
    id : number

    @Column()
    destination : string

    @Column()
    description : string

    @Column()
    startDate : Date

    @Column()
    endDate : Date

    @Column()
    price : number

    @ManyToMany(() => UserDetails, (userdetails) => userdetails.vacations)
    subscribers : UserDetails[]

    @Column()
    imageUrl: string


}