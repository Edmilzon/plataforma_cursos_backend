
GET http://localhost:5000/ranking/students

Descripción: Devuelve el ranking de los mejores estudiantes basado en sus puntos.

[
  {
    "id_usuario": 5,
    "nombre": "Carlos",
    "apellido": "Gomez",
    "avatar_url": "/img/avatar/est3.png",
    "saldo_punto": 300,
    "rank": "1"
  },
  {
    "id_usuario": 10,
    "nombre": "Luis",
    "apellido": "Mendoza",
    "avatar_url": "avatar5.png",
    "saldo_punto": 300,
    "rank": "1"
  },
  {
    "id_usuario": 3,
    "nombre": "Juan",
    "apellido": "Lopez",
    "avatar_url": "/img/avatar/est1.png",
    "saldo_punto": 240,
    "rank": "3"
  },
  {
    "id_usuario": 6,
    "nombre": "Carlos",
    "apellido": "López",
    "avatar_url": "avatar1.png",
    "saldo_punto": 200,
    "rank": "4"
  },
  {
    "id_usuario": 7,
    "nombre": "María",
    "apellido": "Gonzales",
    "avatar_url": "avatar2.png",
    "saldo_punto": 150,
    "rank": "5"
  },
  {
    "id_usuario": 4,
    "nombre": "Maria",
    "apellido": "Perez",
    "avatar_url": "/img/avatar/est2.png",
    "saldo_punto": 130,
    "rank": "6"
  },
  {
    "id_usuario": 11,
    "nombre": "Sofía",
    "apellido": "Pérez",
    "avatar_url": "avatar6.png",
    "saldo_punto": 120,
    "rank": "7"
  },
  {
    "id_usuario": 8,
    "nombre": "Juan",
    "apellido": "Rojas",
    "avatar_url": "avatar3.png",
    "saldo_punto": 100,
    "rank": "8"
  },
  {
    "id_usuario": 12,
    "nombre": "Daniel",
    "apellido": "Castro",
    "avatar_url": "avatar7.png",
    "saldo_punto": 90,
    "rank": "9"
  },
  {
    "id_usuario": 13,
    "nombre": "Lucía",
    "apellido": "Quispe",
    "avatar_url": "avatar8.png",
    "saldo_punto": 60,
    "rank": "10"
  }
]

GET http://localhost:5000/ranking/courses/rating

Descripción: Devuelve el ranking de los cursos con mejor calificación promedio.

[
  {
    "id_curso": 2,
    "titulo": "Introducción a Python",
    "descripcion": "Aprende los fundamentos de Python",
    "calificacion_promedio": "5.00000",
    "rank": "1"
  },
  {
    "id_curso": 5,
    "titulo": "JavaScript Avanzado",
    "descripcion": "Domina JS moderno y frameworks",
    "calificacion_promedio": "4.70000",
    "rank": "2"
  },
  {
    "id_curso": 1,
    "titulo": "Introducción a Python",
    "descripcion": "Aprende los fundamentos de Python desde cero.",
    "calificacion_promedio": "4.50000",
    "rank": "3"
  },
  {
    "id_curso": 3,
    "titulo": "Diseño UX/UI desde cero",
    "descripcion": "Curso práctico de diseño de interfaces",
    "calificacion_promedio": "4.00000",
    "rank": "4"
  },
  {
    "id_curso": 4,
    "titulo": "Emprendimiento Digital",
    "descripcion": "Crea tu negocio en línea",
    "calificacion_promedio": "3.80000",
    "rank": "5"
  }
]

GET http://localhost:5000/ranking/courses/popularity

Descripción: Devuelve el ranking de los cursos más populares (con más estudiantes inscritos).

[
  {
    "id_curso": 1,
    "titulo": "Introducción a Python",
    "descripcion": "Aprende los fundamentos de Python desde cero.",
    "cantidad_estudiantes": "1",
    "rank": "1"
  },
  {
    "id_curso": 2,
    "titulo": "Introducción a Python",
    "descripcion": "Aprende los fundamentos de Python",
    "cantidad_estudiantes": "1",
    "rank": "1"
  },
  {
    "id_curso": 3,
    "titulo": "Diseño UX/UI desde cero",
    "descripcion": "Curso práctico de diseño de interfaces",
    "cantidad_estudiantes": "1",
    "rank": "1"
  },
  {
    "id_curso": 4,
    "titulo": "Emprendimiento Digital",
    "descripcion": "Crea tu negocio en línea",
    "cantidad_estudiantes": "1",
    "rank": "1"
  },
  {
    "id_curso": 5,
    "titulo": "JavaScript Avanzado",
    "descripcion": "Domina JS moderno y frameworks",
    "cantidad_estudiantes": "1",
    "rank": "1"
  }
]

---

## Módulo de Cursos

### `GET http://localhost:5000/cursos`

**Descripción:** Devuelve una lista de todos los cursos disponibles.

**Respuesta de ejemplo:**
```json
[
  {
    "id_curso": 1,
    "titulo": "Introducción a Python",
    "descripcion": "Aprende los fundamentos de Python desde cero.",
    "fecha_inicio": "2024-01-15",
    "fecha_fin": "2024-03-15",
    "duracion": 60,
    "precio": "50.00",
    "modalidad": "Online",
    "docente": {
      "id_usuario": 2,
      "nombre": "Ana",
      "apellido": "García"
    },
    "tipo_curso": {
      "id_tipo_curso": 1,
      "nombre": "Programación"
    }
  }
]
```

### `GET http://localhost:5000/cursos/:id`

**Descripción:** Devuelve un curso específico por su ID.

**Respuesta de ejemplo:**
```json
{
  "id_curso": 1,
  "titulo": "Introducción a Python",
  "descripcion": "Aprende los fundamentos de Python desde cero.",
  "fecha_inicio": "2024-01-15",
  "fecha_fin": "2024-03-15",
  "duracion": 60,
  "precio": "50.00",
  "modalidad": "Online",
  "docente": {
    "id_usuario": 2,
    "nombre": "Ana",
    "apellido": "García"
  },
  "tipo_curso": {
    "id_tipo_curso": 1,
    "nombre": "Programación"
  }
}
```

### `POST http://localhost:5000/cursos`

**Descripción:** Crea un nuevo curso.

**Cuerpo de la petición (Request Body):**
```json
{
  "titulo": "Nuevo Curso de Node.js",
  "descripcion": "Aprende a crear APIs con Node.js y NestJS.",
  "fecha_inicio": "2024-08-01",
  "fecha_fin": "2024-10-01",
  "duracion": 80,
  "precio": 75.50,
  "modalidad": "Online",
  "id_docente": 2,
  "id_tipo_curso": 1
}
```

**Respuesta de ejemplo (al crear):**
```json
{
    "message": "Curso creado exitosamente",
    "status": 201,
    "data": {
        "id": 6,
        "titulo": "Nuevo Curso de Node.js",
        "descripcion": "Aprende a crear APIs con Node.js y NestJS.",
        "fecha_inicio": "2024-08-01",
        "fecha_fin": "2024-10-01",
        "duracion": 80,
        "precio": 75.5,
        "modalidad": "Online",
        "id_docente": 2,
        "id_tipo_curso": 1
    }
}
```

### `PATCH http://localhost:5000/cursos/:id`

**Descripción:** Actualiza parcialmente un curso existente por su ID.

**Cuerpo de la petición (Request Body):**
```json
{
  "titulo": "Curso de Node.js Avanzado",
  "precio": 80.00
}
```

### `DELETE http://localhost:5000/cursos/:id`

**Descripción:** Elimina un curso por su ID.

---

## Módulo de Módulos (dentro de Cursos)

### `POST http://localhost:5000/cursos/:cursoId/modulos`

**Descripción:** Crea un nuevo módulo para un curso específico.

**Cuerpo de la petición (Request Body):**
```json
{
  "nombre": "Módulo 1: Fundamentos",
  "descripcion": "Introducción a los conceptos básicos.",
  "orden": 1
}
```

### `GET http://localhost:5000/cursos/:cursoId/modulos`

**Descripción:** Devuelve todos los módulos de un curso específico.

### `PATCH http://localhost:5000/cursos/modulos/:id`

**Descripción:** Actualiza un módulo existente por su ID.

**Cuerpo de la petición (Request Body):**
```json
{
  "nombre": "Módulo 1: Conceptos Fundamentales",
  "orden": 2
}
```

### `DELETE http://localhost:5000/cursos/modulos/:id`

**Descripción:** Elimina un módulo por su ID.

---

## Módulo de Horarios (dentro de Cursos)

### `POST http://localhost:5000/cursos/:cursoId/horarios`

**Descripción:** Crea un nuevo horario para un curso específico.

**Cuerpo de la petición (Request Body):**
```json
{
  "dia_semana": "Lunes",
  "hora_inicio": "19:00:00",
  "hora_fin": "21:00:00"
}
```

### `GET http://localhost:5000/cursos/:cursoId/horarios`

**Descripción:** Devuelve todos los horarios de un curso específico.

### `PATCH http://localhost:5000/cursos/horarios/:id`

**Descripción:** Actualiza un horario existente por su ID.

**Cuerpo de la petición (Request Body):**
```json
{
  "hora_fin": "21:30:00"
}
```

### `DELETE http://localhost:5000/cursos/horarios/:id`

**Descripción:** Elimina un horario por su ID.

---

## Módulo de Lecciones, Tareas y Evaluaciones

### `GET http://localhost:5000/lecciones/:id`
**Descripción:** Devuelve una lección específica por su ID.

### `PATCH http://localhost:5000/lecciones/:id`
**Descripción:** Actualiza una lección existente por su ID.

### `DELETE http://localhost:5000/lecciones/:id`
**Descripción:** Elimina una lección por su ID.

---

### `POST http://localhost:5000/lecciones/:leccionId/tareas`

**Descripción:** Crea una nueva tarea para una lección específica.

**Cuerpo de la petición (Request Body):**
```json
{
  "titulo": "Tarea 1: Investigación",
  "descripcion": "Investigar sobre los conceptos vistos en clase.",
  "fecha_entrega": "2024-09-15"
}
```

### `GET http://localhost:5000/lecciones/:leccionId/tareas`

**Descripción:** Devuelve todas las tareas de una lección específica.

### `PATCH http://localhost:5000/lecciones/tareas/:id`

**Descripción:** Actualiza una tarea existente por su ID.

### `DELETE http://localhost:5000/lecciones/tareas/:id`

**Descripción:** Elimina una tarea por su ID.

---

### `POST http://localhost:5000/lecciones/:leccionId/evaluaciones`

**Descripción:** Crea una nueva evaluación para una lección específica.

**Cuerpo de la petición (Request Body):**
```json
{
  "titulo": "Examen Parcial 1",
  "descripcion": "Evaluación de los temas del Módulo 1.",
  "tipo": "Cuestionario",
  "fecha_hora_inicio": "2024-09-20T09:00:00Z",
  "fecha_hora_entrega": "2024-09-20T11:00:00Z",
  "calificacion_maxima": 20
}
```

### `GET http://localhost:5000/lecciones/:leccionId/evaluaciones`

**Descripción:** Devuelve todas las evaluaciones de una lección específica.

### `PATCH http://localhost:5000/lecciones/evaluaciones/:id`

**Descripción:** Actualiza una evaluación existente por su ID.

### `DELETE http://localhost:5000/lecciones/evaluaciones/:id`

**Descripción:** Elimina una evaluación por su ID.
