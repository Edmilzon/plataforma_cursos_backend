export class UserRankingDto {
    id_usuario: number;
    nombre: string;
    apellido: string;
    avatar_url: string;
    saldo_punto: number;
    rank: number;
}

export class CourseRatingRankingDto {
    id_curso: number;
    titulo: string;
    descripcion: string;
    calificacion_promedio: number;
    rank: number;
}

export class CoursePopularityRankingDto {
    id_curso: number;
    titulo: string;
    descripcion: string;
    cantidad_estudiantes: number;
    rank: number;
}
