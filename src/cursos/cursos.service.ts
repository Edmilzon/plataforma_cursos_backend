import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Curso } from './interface/curso.interface';

@Injectable()
export class CursosService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Obtiene todos los cursos de la base de datos.
   * Une las tablas de curso, usuario (docente) y tipo_curso.
   */
  async findAll(): Promise<Curso[]> {
    const query = `
      SELECT
        c.id_curso,
        c.titulo,
        c.descripcion,
        c.fecha_inicio,
        c.fecha_fin,
        c.duracion,
        c.precio,
        c.modalidad,
        JSON_OBJECT('id_usuario', u.id_usuario, 'nombre', u.nombre, 'apellido', u.apellido) as docente,
        JSON_OBJECT('id_tipo_curso', tc.id_tipo_curso, 'nombre', tc.nombre) as tipo_curso
      FROM curso c
      JOIN usuario u ON c.id_docente = u.id_usuario
      JOIN tipo_curso tc ON c.id_tipo_curso = tc.id_tipo_curso;
    `;
    const cursos = await this.dataSource.query(query);
    return cursos;
  }

  /**
   * Busca y obtiene un curso específico por su ID.
   * @param id - El ID del curso a buscar.
   */
  async findOne(id: number): Promise<Curso> {
    const query = `
      SELECT
        c.id_curso,
        c.titulo,
        c.descripcion,
        c.fecha_inicio,
        c.fecha_fin,
        c.duracion,
        c.precio,
        c.modalidad,
        JSON_OBJECT('id_usuario', u.id_usuario, 'nombre', u.nombre, 'apellido', u.apellido) as docente,
        JSON_OBJECT('id_tipo_curso', tc.id_tipo_curso, 'nombre', tc.nombre) as tipo_curso
      FROM curso c
      JOIN usuario u ON c.id_docente = u.id_usuario
      JOIN tipo_curso tc ON c.id_tipo_curso = tc.id_tipo_curso
      WHERE c.id_curso = ?;
    `;
    const result = await this.dataSource.query(query, [id]);

    if (result.length === 0) {
      throw new NotFoundException(`El curso con ID ${id} no fue encontrado.`);
    }

    return result[0];
  }
}