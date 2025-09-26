import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class UserEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 50})
    name: string;

    @Column({length: 50})
    lastname: string;

    @Column({length: 50, unique: true})
    email: string;

    @Column({length: 50})
    password: string;

    @Column({length: 50})
    phone: string;

    @Column({length: 50, default: 'user'})
    rol: string;
}