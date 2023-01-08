import { IsEmail, MaxLength, MinLength } from "class-validator"
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm"
import { UserDetails } from "./UserDetails"



@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true, nullable: false})
    @MinLength(6, {
        message: "Username too short"
    })
    @MaxLength(30, {
        message: "Username too long"
    })
    username: string

    @Column({nullable: false, select: false})
    password: string

    @OneToOne(() => UserDetails, (userDetails) => userDetails.user, {onDelete: 'CASCADE', cascade: true})
    @JoinColumn()
    userDetails: UserDetails

}
