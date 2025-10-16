import { UserRole } from "../dto/user.dto";

export interface User {
    id_usuario: number;
    nombre: string;
    apellido: string;
    edad?: number;
    correo: string;
    password?: string;
    fecha_registro: Date;
    avatar_url?: string;
    saldo_punto: number;
    rol: UserRole;
}