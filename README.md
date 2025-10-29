<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).


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