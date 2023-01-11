import { Column, Entity, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn, } from "typeorm";
import { User } from "./User";
import { Vacation } from "./Vacation";
import {
    validate,
    validateOrReject,
    Contains,
    IsInt,
    Length,
    IsEmail,
    IsFQDN,
    IsDate,
    Min,
    Max,
    MinLength,
    MaxLength,
  } from 'class-validator';

@Entity()
export class UserDetails {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, nullable: false })
    @IsEmail()
    email: string

    @Column()
    @MinLength(2, {
        message: "First name too short"
    })
    @MaxLength(30, {
        message: "First name too long"
    })
    firstName: string

    @Column()
    @MinLength(2, {
        message: "First name too short"
    })
    @MaxLength(30, {
        message: "First name too long"
    })
    lastName: string

    @Column({ default: false, nullable: false })
    isAdmin: boolean

    @OneToOne(() => User, (user: User) => user.userDetails)
    user: User

    @ManyToMany(() => Vacation, (vacation) => vacation.subscribers, { cascade: true, onDelete: 'CASCADE' })
    @JoinTable()
    vacations: Vacation[]

}