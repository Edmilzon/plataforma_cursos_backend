import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CoursePopularityRankingDto, CourseRatingRankingDto, UserRankingDto } from './dto/ranking.dto';

@Injectable()
export class RankingService {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Obtiene el ranking de los mejores estudiantes basado en sus puntos.
     */
    async getTopStudentsByPoints(limit: number = 10): Promise<UserRankingDto[]> {
        const query = `
            SELECT 
                id_usuario,
                nombre,
                apellido,
                avatar_url,
                saldo_punto,
                RANK() OVER (ORDER BY saldo_punto DESC) as 'rank'
            FROM usuario
            ORDER BY saldo_punto DESC
            LIMIT ?;
        `;
        const students: UserRankingDto[] = await this.dataSource.query(query, [limit]);
        if (!students.length) {
            throw new NotFoundException('No se encontraron estudiantes para el ranking.');
        }
        return students;
    }

    /**
     * Obtiene el ranking de los cursos mejor valorados.
     */
    async getTopRatedCourses(limit: number = 10): Promise<CourseRatingRankingDto[]> {
        const query = `
            SELECT 
                c.id_curso,
                c.titulo,
                c.descripcion,
                AVG(v.calificacion) as calificacion_promedio,
                RANK() OVER (ORDER BY AVG(v.calificacion) DESC) as 'rank'
            FROM valoracion v
            JOIN curso c ON v.id_curso = c.id_curso
            GROUP BY c.id_curso
            ORDER BY calificacion_promedio DESC
            LIMIT ?;
        `;
        const courses: CourseRatingRankingDto[] = await this.dataSource.query(query, [limit]);
        if (!courses.length) {
            throw new NotFoundException('No se encontraron cursos valorados para el ranking.');
        }
        return courses;
    }

    /**
     * Obtiene el ranking de los cursos más populares (con más inscripciones).
     */
    async getMostPopularCourses(limit: number = 10): Promise<CoursePopularityRankingDto[]> {
        const query = `
            SELECT
                c.id_curso,
                c.titulo,
                c.descripcion,
                COUNT(i.id_inscripcion) as cantidad_estudiantes,
                RANK() OVER (ORDER BY COUNT(i.id_inscripcion) DESC) as 'rank'
            FROM inscripcion i
            JOIN curso c ON i.id_curso = c.id_curso
            GROUP BY c.id_curso
            ORDER BY cantidad_estudiantes DESC
            LIMIT ?;
        `;
        const courses: CoursePopularityRankingDto[] = await this.dataSource.query(query, [limit]);
        if (!courses.length) {
            throw new NotFoundException('No se encontraron cursos con inscripciones para el ranking.');
        }
        return courses;
    }
}
