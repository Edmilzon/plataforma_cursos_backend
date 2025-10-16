export class CursoEntity {
  id_curso: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  duracion: number;
  precio: number;
  modalidad: string;
  id_docente: number;
  id_tipo_curso: number;
}