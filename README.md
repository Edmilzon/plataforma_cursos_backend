# API del Módulo de Usuarios

Esta es la documentación para la API REST del módulo de usuarios.

## Endpoints

---

### 1. Registrar un nuevo usuario

- **URL:** `/user/register`
- **Método:** `POST`
- **Descripción:** Crea un nuevo usuario en el sistema. El rol por defecto es 'Estudiante' si no se especifica.

#### Formato de la Petición (Request Body)

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan.perez@example.com",
  "password": "password123",
  "edad": 25,
  "avatar_url": "http://example.com/avatar.jpg",
  "rol": "Estudiante"
}
```

**Campos:**
- `nombre` (string, requerido): Nombre del usuario.
- `apellido` (string, requerido): Apellido del usuario.
- `correo` (string, email, requerido): Correo electrónico único.
- `password` (string, requerido, min 6 caracteres): Contraseña del usuario.
- `edad` (number, opcional): Edad del usuario.
- `avatar_url` (string, url, opcional): URL de la imagen de perfil.
- `rol` (enum, opcional): Rol del usuario. Valores posibles: `Administrador`, `Docente`, `Estudiante`. Por defecto: `Estudiante`.

#### Formato de la Respuesta (Response Body) - `201 Created`

```json
{
  "id_usuario": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "edad": 25,
  "correo": "juan.perez@example.com",
  "fecha_registro": "2023-10-27T10:00:00.000Z",
  "avatar_url": "http://example.com/avatar.jpg",
  "saldo_punto": 0,
  "rol": "Estudiante"
}
```

---

### 2. Iniciar sesión

- **URL:** `/user/login`
- **Método:** `POST`
- **Descripción:** Autentica a un usuario y devuelve un token JWT junto con los datos del usuario.

#### Formato de la Petición (Request Body)

```json
{
  "correo": "juan.perez@example.com",
  "password": "password123"
}
```

#### Formato de la Respuesta (Response Body) - `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_usuario": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "edad": 25,
    "correo": "juan.perez@example.com",
    "fecha_registro": "2023-10-27T10:00:00.000Z",
    "avatar_url": "http://example.com/avatar.jpg",
    "saldo_punto": 0,
    "rol": "Estudiante"
  }
}
```

---

### 3. Obtener todos los usuarios

- **URL:** `/user`
- **Método:** `GET`
- **Descripción:** Devuelve una lista de todos los usuarios registrados.

#### Formato de la Respuesta (Response Body) - `200 OK`

```json
[
  {
    "id_usuario": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "edad": 25,
    "correo": "juan.perez@example.com",
    "fecha_registro": "2023-10-27T10:00:00.000Z",
    "avatar_url": "http://example.com/avatar.jpg",
    "saldo_punto": 0,
    "rol": "Estudiante"
  },
  {
    "id_usuario": 2,
    "nombre": "Ana",
    "apellido": "Gomez",
    "edad": 35,
    "correo": "ana.gomez@example.com",
    "fecha_registro": "2023-10-26T12:00:00.000Z",
    "avatar_url": null,
    "saldo_punto": 100,
    "rol": "Docente"
  }
]
```

---

### 4. Obtener usuarios por rol

- **URL:** `/user/rol?rol=<nombre_del_rol>`
- **Método:** `GET`
- **Descripción:** Devuelve una lista de usuarios que coinciden con el rol especificado.
- **Parámetros de Consulta (Query Params):**
  - `rol` (string, requerido): Rol a filtrar. Ej: `Estudiante`, `Docente`, `Administrador`.

#### Formato de la Respuesta (Response Body) - `200 OK`

La respuesta es un array de usuarios, similar al de "Obtener todos los usuarios", pero filtrado por el rol.

---

### 5. Obtener un usuario por ID

- **URL:** `/user/:id`
- **Método:** `GET`
- **Descripción:** Devuelve un usuario específico por su ID.

#### Formato de la Respuesta (Response Body) - `200 OK`

La respuesta es un objeto de usuario, similar al de la respuesta de registro.

---

# API del Módulo de Rankings

Esta sección documenta los endpoints para obtener diferentes clasificaciones dentro de la plataforma.

---

### 1. Ranking de mejores estudiantes

- **URL:** `/ranking/students`
- **Método:** `GET`
- **Descripción:** Obtiene el ranking de los mejores estudiantes basado en su `saldo_punto`.
- **Parámetros de Consulta (Query Params):**
  - `limit` (number, opcional): Define el número de estudiantes a devolver. Por defecto es `10`.

#### Formato de la Respuesta (Response Body) - `200 OK`

```json
[
  {
    "id_usuario": 15,
    "nombre": "Carlos",
    "apellido": "Ruiz",
    "avatar_url": "http://example.com/avatar/carlos.jpg",
    "saldo_punto": 1500,
    "rank": 1
  },
  {
    "id_usuario": 8,
    "nombre": "Lucia",
    "apellido": "Fernandez",
    "avatar_url": "http://example.com/avatar/lucia.jpg",
    "saldo_punto": 1450,
    "rank": 2
  }
]
```

---

### 2. Ranking de cursos por valoración

- **URL:** `/ranking/courses/rating`
- **Método:** `GET`
- **Descripción:** Obtiene el ranking de los cursos mejor valorados según la calificación promedio de los usuarios.
- **Parámetros de Consulta (Query Params):**
  - `limit` (number, opcional): Define el número de cursos a devolver. Por defecto es `10`.

#### Formato de la Respuesta (Response Body) - `200 OK`

```json
[
  {
    "id_curso": 5,
    "titulo": "Introducción a Machine Learning",
    "descripcion": "Aprende los fundamentos del Machine Learning.",
    "calificacion_promedio": 4.9,
    "rank": 1
  },
  {
    "id_curso": 2,
    "titulo": "Desarrollo Web con React",
    "descripcion": "Crea aplicaciones web modernas.",
    "calificacion_promedio": 4.8,
    "rank": 2
  }
]
```

---

### 3. Ranking de cursos por popularidad

- **URL:** `/ranking/courses/popularity`
- **Método:** `GET`
- **Descripción:** Obtiene el ranking de los cursos más populares, basado en el número de estudiantes inscritos.
- **Parámetros de Consulta (Query Params):**
  - `limit` (number, opcional): Define el número de cursos a devolver. Por defecto es `10`.

#### Formato de la Respuesta (Response Body) - `200 OK`

La respuesta es un array de objetos con la siguiente estructura:

```json
[
  {
    "id_curso": 2,
    "titulo": "Desarrollo Web con React",
    "descripcion": "Crea aplicaciones web modernas.",
    "cantidad_estudiantes": 150,
    "rank": 1
  },
  {
    "id_curso": 1,
    "titulo": "Bases de Datos desde Cero",
    "descripcion": "Todo sobre SQL y NoSQL.",
    "cantidad_estudiantes": 125,
    "rank": 2
  }
]
```

---

# API del Módulo de Cursos

Esta sección documenta los endpoints para la gestión de cursos, módulos y horarios.

## Endpoints de Cursos

---

### 1. Crear un nuevo curso

- **URL:** `/cursos`
- **Método:** `POST`
- **Descripción:** Crea un nuevo curso en la plataforma.

#### Formato de la Petición (Request Body)

```json
{
  "titulo": "Curso de NestJS desde Cero",
  "descripcion": "Aprende a construir APIs robustas con NestJS.",
  "fecha_inicio": "2024-08-01",
  "fecha_fin": "2024-09-01",
  "duracion": 40,
  "precio": 99.99,
  "modalidad": "Online",
  "id_docente": 2,
  "id_tipo_curso": 1,
  "cupo": 50,
  "imagen_portada_url": "http://example.com/curso-nestjs.png"
}
```

#### Formato de la Respuesta (Response Body) - `201 Created`

Devuelve el objeto del curso recién creado, incluyendo la información del docente y el tipo de curso.

```json
{
  "id_curso": 10,
  "titulo": "Curso de NestJS desde Cero",
  "descripcion": "Aprende a construir APIs robustas con NestJS.",
  "fecha_inicio": "2024-08-01",
  "fecha_fin": "2024-09-01",
  "duracion": 40,
  "precio": "99.99",
  "modalidad": "Online",
  "cupo": 50,
  "imagen_portada_url": "http://example.com/curso-nestjs.png",
  "docente": {
    "id_usuario": 2,
    "nombre": "Ana",
    "apellido": "Gomez"
  },
  "tipo_curso": {
    "id_tipo_curso": 1,
    "nombre": "Desarrollo Web"
  }
}
```

---

### 2. Obtener todos los cursos

- **URL:** `/cursos`
- **Método:** `GET`
- **Descripción:** Devuelve una lista de todos los cursos disponibles.

#### Formato de la Respuesta (Response Body) - `200 OK`

```json
[
  {
    "id_curso": 10,
    "titulo": "Curso de NestJS desde Cero",
    "descripcion": "Aprende a construir APIs robustas con NestJS.",
    "fecha_inicio": "2024-08-01",
    "fecha_fin": "2024-09-01",
    "duracion": 40,
    "precio": "99.99",
    "modalidad": "Online",
    "docente": {
      "id_usuario": 2,
      "nombre": "Ana",
      "apellido": "Gomez"
    },
    "tipo_curso": {
      "id_tipo_curso": 1,
      "nombre": "Desarrollo Web"
    }
  }
]
```

---

### 3. Obtener un curso por ID

- **URL:** `/cursos/:id`
- **Método:** `GET`
- **Descripción:** Devuelve un curso específico por su ID.

#### Formato de la Respuesta (Response Body) - `200 OK`

La respuesta es un único objeto de curso, con la misma estructura que en la creación.

---

### 4. Actualizar un curso

- **URL:** `/cursos/:id`
- **Método:** `PATCH`
- **Descripción:** Actualiza parcialmente la información de un curso.

#### Formato de la Petición (Request Body)

Todos los campos son opcionales.

```json
{
  "precio": 89.99,
  "modalidad": "Híbrida"
}
```

#### Formato de la Respuesta (Response Body) - `200 OK`

Devuelve el objeto del curso completo con los datos actualizados.

---

### 5. Eliminar un curso

- **URL:** `/cursos/:id`
- **Método:** `DELETE`
- **Descripción:** Elimina un curso de la base de datos.
- **Respuesta:** `204 No Content`

---

## Endpoints de Módulos (dentro de un curso)

### Crear un módulo

- **URL:** `/cursos/:cursoId/modulos`
- **Método:** `POST`

#### Petición
```json
{
  "nombre": "Introducción a NestJS",
  "descripcion": "Conceptos básicos y estructura del proyecto.",
  "orden": 1
}
```

### Obtener todos los módulos de un curso

- **URL:** `/cursos/:cursoId/modulos`
- **Método:** `GET`

---

## Endpoints de Horarios (dentro de un curso)

### Crear un horario

- **URL:** `/cursos/:cursoId/horarios`
- **Método:** `POST`

#### Petición
```json
{
  "dia_semana": "Lunes",
  "hora_inicio": "19:00:00",
  "hora_fin": "21:00:00"
}
```

### Obtener todos los horarios de un curso

- **URL:** `/cursos/:cursoId/horarios`
- **Método:** `GET`

---

*Nota: Los endpoints para actualizar (`PATCH`) y eliminar (`DELETE`) módulos y horarios siguen un patrón similar, usando `/cursos/modulos/:id` y `/cursos/horarios/:id` respectivamente.*

---

# API del Módulo de Lecciones

Esta sección documenta los endpoints para la gestión de lecciones, tareas y evaluaciones.

**Nota Importante:** La creación y listado de lecciones se gestiona a través del módulo de cursos para mantener una estructura de recursos anidada y lógica.

- **Crear una lección:** `POST /cursos/:cursoId/modulos/:moduloId/lecciones`
```json
{
  "titulo": "Introducción a los Controladores",
  "contenido": "En esta lección aprenderemos sobre los controladores en NestJS...",
  "url_recurso": "http://example.com/video1.mp4",
  "orden": 1
}

```
- **Obtener lecciones de un módulo:** `GET /cursos/:cursoId/modulos/:moduloId/lecciones`

## Endpoints de Lecciones

---

### 1. Obtener una lección por ID

- **URL:** `/lecciones/:id`
- **Método:** `GET`
- **Descripción:** Devuelve una lección específica por su ID.

#### Formato de la Respuesta (Response Body) - `200 OK`

```json
{
  "id_leccion": 1,
  "titulo": "Introducción a los Controladores",
  "contenido": "En esta lección aprenderemos sobre los controladores en NestJS...",
  "url_recurso": "http://example.com/video1.mp4",
  "orden": 1,
  "imagen_thumbnail_url": "http://example.com/thumb1.jpg",
  "id_modulo": 1
}
```

---

### 2. Actualizar una lección

- **URL:** `/lecciones/:id`
- **Método:** `PATCH`
- **Descripción:** Actualiza parcialmente la información de una lección.

#### Formato de la Petición (Request Body)

Todos los campos son opcionales.

```json
{
  "titulo": "Controladores y Rutas Avanzadas",
  "orden": 2
}
```

#### Formato de la Respuesta (Response Body) - `200 OK`

Devuelve el objeto de la lección completa con los datos actualizados.

---

### 3. Eliminar una lección

- **URL:** `/lecciones/:id`
- **Método:** `DELETE`
- **Descripción:** Elimina una lección de la base de datos.
- **Respuesta:** `204 No Content`

---

## Endpoints de Tareas (anidadas en Lecciones)

### 1. Crear una tarea para una lección

- **URL:** `/lecciones/:leccionId/tareas`
- **Método:** `POST`

#### Formato de la Petición (Request Body)

```json
{
  "titulo": "Ejercicio Práctico de Controladores",
  "descripcion": "Crear un CRUD básico para la entidad 'producto'.",
  "url_contenido": "http://example.com/ejercicio.pdf",
  "fecha_entrega": "2024-09-15"
}
```

#### Formato de la Respuesta (Response Body) - `201 Created`

Devuelve el objeto de la tarea recién creada.

---

### 2. Obtener todas las tareas de una lección

- **URL:** `/lecciones/:leccionId/tareas`
- **Método:** `GET`

#### Formato de la Respuesta (Response Body) - `200 OK`

Devuelve un array de objetos de tarea.

---

## Endpoints de Evaluaciones (anidadas en Lecciones)

### 1. Crear una evaluación para una lección

- **URL:** `/lecciones/:leccionId/evaluaciones`
- **Método:** `POST`

#### Formato de la Petición (Request Body)

```json
{
  "titulo": "Examen Parcial 1",
  "descripcion": "Evaluación de los conceptos de Módulos y Controladores.",
  "tipo": "Cuestionario",
  "fecha_hora_inicio": "2024-09-20T10:00:00Z",
  "fecha_hora_entrega": "2024-09-20T11:00:00Z",
  "calificacion_maxima": 100
}
```

#### Formato de la Respuesta (Response Body) - `201 Created`

Devuelve el objeto de la evaluación recién creada.

---

### 2. Obtener todas las evaluaciones de una lección

- **URL:** `/lecciones/:leccionId/evaluaciones`
- **Método:** `GET`

---

*Nota: Los endpoints para actualizar (`PATCH`) y eliminar (`DELETE`) tareas y evaluaciones siguen un patrón similar, usando `/lecciones/tareas/:id` y `/lecciones/evaluaciones/:id` respectivamente.*
]
```