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

    async getTopStudentsByPoints(limit: number = 10): Promise<UserRankingDto[]> {
        const query = `
            SELECT 
                id_usuario,
                nombre,
                apellido,
                avatar_url,
                saldo_punto,
                ROW_NUMBER() OVER (ORDER BY saldo_punto DESC, id_usuario ASC) as 'rank'
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

    async getTopRatedCourses(limit: number = 10): Promise<CourseRatingRankingDto[]> {
        const query = `
            SELECT 
                c.id_curso,
                c.titulo,
                c.descripcion,
                AVG(v.calificacion) as calificacion_promedio,
                ROW_NUMBER() OVER (ORDER BY AVG(v.calificacion) DESC, c.id_curso ASC) as 'rank'
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

    async getMostPopularCourses(limit: number = 10): Promise<CoursePopularityRankingDto[]> {
        const query = `
            SELECT
                c.id_curso,
                c.titulo,
                c.descripcion,
                COUNT(i.id_inscripcion) as cantidad_estudiantes,
                ROW_NUMBER() OVER (ORDER BY COUNT(i.id_inscripcion) DESC, c.id_curso ASC) as 'rank'
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

      async getStudentRanking(limit: number = 10) {
    const query = `
      SELECT
          u.id_usuario,
          CONCAT(u.nombre, ' ', u.apellido) AS nombre_completo,
          u.avatar_url,
          u.saldo_punto AS puntos,
          (SELECT COUNT(*) FROM certificado c WHERE c.id_usuario = u.id_usuario) AS certificados_obtenidos,
          (SELECT COUNT(*) FROM progreso_leccion pl WHERE pl.id_usuario = u.id_usuario AND pl.completado = TRUE) AS lecciones_completadas,
          ROW_NUMBER() OVER (ORDER BY u.saldo_punto DESC) as posicion
      FROM 
          usuario u
      JOIN 
          usuario_rol ur ON u.id_usuario = ur.id_usuario
      JOIN 
          rol r ON ur.id_rol = r.id_rol
      WHERE 
          r.nombre = 'Estudiante'
      GROUP BY u.id_usuario
      ORDER BY puntos DESC, u.id_usuario
      LIMIT ?
    `;
    return this.dataSource.query(query, [limit]);
  }
}
