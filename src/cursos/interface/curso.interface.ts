// Este archivo define la forma que tendrán los objetos de curso en nuestra aplicación.

// Interfaz para la información básica del docente
export interface Docente {
  id_usuario: number;
  nombre: string;
  apellido: string;
}

// Interfaz para el tipo de curso
export interface TipoCurso {
  id_tipo_curso: number;
  nombre: string;
}

// Interfaz principal del curso, que incluye al docente y el tipo de curso
export interface Curso {
  id_curso: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  duracion: number;
  precio: number;
  modalidad: string;
  docente: Docente;
  tipo_curso: TipoCurso;
}