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
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
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

The Text Analyzer Tool is a web-based API that allows users to analyze textual content by breaking it down into meaningful statistics. It provides various features including word count, sentence count, character count, paragraph count, and finding the longest words in a given text. Additionally, it generates user-specific reports summarizing these analyses across multiple texts.

## Features

- Create and store texts: Users can get into CRUD texts operation to their profiles.
- Text analysis: Perform various analyses on the text including:
  - Word count
  - Sentence count
  - Character count
  - Paragraph count
  - Longest words in the text
- User Reports: Generate comprehensive reports for individual users based on their texts.
- Authentication: The API is protected by JWT-based and Google OAuth 2.0 authentication .
- Caching: Redis based caching
- API Throttling: Save gaurd the API
- Unit Test Coverage: Followed the TDD approach
- Log Visualization: Nestjs Logger

## Technologies Used
- Backend:
  - NestJS
  - TypeORM
  - PostgreSQL
- Authentication: JWT (JSON Web Token), OAuth 2.0
- Caching: Cache Manager with Redis 
- Unit Testing: Jest, Supertest

## API Endpoints

### Authentication

- Register
  - POST http://localhost:3000/api/v1/user

  - Registers a new user.
    Request Body:
  ```
  {
    "username": "username",
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

- Login
  - POST http://localhost:3000/api/v1/auth/login

    - Logs in the user and returns a JWT token. Add accessToken in the header of every request.
    - In Postman, create a new request. Go to the Authorization tab. Select Auth Type as Bearer Token and add the token for every request.

    Request Body:
    ```
    {
        "username":"username2",
        "password":"123456Aa"
    }
    ```

    Response:
    ```
    {
        "id": ,
        "accessToken": "",
        "refreshToken": ""
    }
    ```

- Google OAuth 2
  - http://localhost:3000/api/v1/api/v1/auth/google/callback
  - Use the browser to test it
  - Response in the url bar
    - `http://localhost:5173?token=${response.accessToken}`
    - Use this token for further request

- JWT Refresh Token
  - POST http://localhost:3000/api/v1/api/v1/auth/refresh
  - Response:
    ```
    {
        "id": ,
        "accessToken": "",
        "refreshToken": ""
    }
    ```

- Signout
  - POST http://localhost:3000/api/v1/api/v1/auth/signout

### Text Management
- Create Text 
  - POST http://localhost:3000/api/v1/texts
  - Adds a new text for the authenticated user.
  - Request Body:
    ```
    {
      "content": "This is a sample text."
    }
    ```
- Get All Texts
  - GET http://localhost:3000/api/v1/texts
  - Retrieves all texts of the authenticated user.
- Get Text by ID
  - GET http://localhost:3000/api/v1/texts/:id
  - Retrieves the text with the given id for the authenticated user.
- Update Text
  - PUT http://localhost:3000/api/v1/texts/:id

  - Updates the content of the text with the given id.
  - Request Body:
    ```
    {
      "content": "Updated text content."
    }
    ```
- Delete Text
  - DELETE http://localhost:3000/api/v1/texts/:id
  - Deletes the text with the given id.
### Text Analysis 
  - Word Count
    - GET http://localhost:3000/api/v1/texts/:id/word-count
    - Returns the word count of the specified text.
    - Response:
      ```
      {
        "count": 5
      }
      ```
  - Sentence Count
    - GET http://localhost:3000/api/v1/texts/:id/sentence-count
    - Returns the sentence count of the specified text.
    - Response:
      ```
      {
        "count": 2
      }
      ```
- Character Count
  - GET http://localhost:3000/api/v1/texts/:id/character-count

  - Returns the character count of the specified text (excluding punctuation).
  - Response:
    ```
      {
        "count": 29
      }
    ```
- Paragraph Count
  - GET http://localhost:3000/api/v1/texts/:id/paragraph-count
  - Returns the paragraph count of the specified text.
  - Response:
    ```
    {
      "count": 1
    }
    ```
- Longest Words
  - GET http://localhost:3000/api/v1/texts/:id/longest-words

  - Returns the longest words in the specified text.
  - Response:
    ```
    {
      "longestWords": ["one","two","sev"]
    }
    ```
### User Report
  - GET http://localhost:3000/api/v1/texts/report/user
  - Generates a report for the authenticated user, summarizing their texts and text analyses.
  - Response:
    ```
    {
      "userId": 1,
      "texts": [
        {
          "id": 1,
          "content": "This is a sample text.",
          "wordCount": 5,
          "characterCount": 20,
          "sentenceCount": 1,
          "paragraphCount": 1,
          "longestWords": ["sample"]
        }
      ]
    }
    ```
### User Profile
  - GET http://localhost:3000/api/v1/user/profile

### Update User
  - PATCH http://localhost:3000/api/v1/user/:id

###  Delete User
  - DELETE http://localhost:3000/api/v1/user/:id

## Project setup

### Install node, npm, yarn, postgres, and redis. Make sure postgres and redis are running.
### Clone the project

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev
```

## Run tests

```bash
# unit tests
$ yarn run test

# test coverage
$ yarn run test:cov
```
## Further Improvement

- Write Integretion Tests
- Docker for containerization
- Integrate Open API Specification for documenting APIs

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
