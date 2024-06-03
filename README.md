#Adonis JS 6 Prisma Adapter

This package is useful if you want to give a try to PrismaJS within Adonis JS 6.

## Getting Started

### Installation

 ```sh
  npm install @arthurfranckpat/adonis-prisma
  ```
You should use your favorite package manager.

Then configure the package via :
  ```sh
  node ace configure @arthurfranckpat/adonis-prisma
  ```
  This command will scaffold the config files, providers and create a prisma folder with ``prisma.schema`` file.

### Post Installation
After installation, you should run the proper commands to migrate your schema and/or generate the Prisma Client :
```sh
  npx prisma generate
  ```

## Usage

You have two options to use the Prisma Client.
First,via Adonis IoC Container :

```sh
const prisma = await app.container.make('prisma:db')
```

Or by destructuring `HttpContext`object : 
```
//route.ts

router
  .get('/', async function ({ prisma }: HttpContext) {
    ...
    const posts = await prisma.post.findMany())
    ...
  })
```

### Authentication

First,you should install the `@adonisjs/auth` and configure it with `Session` as Auth Guard.
Then, you should replace the `provider` key in the `config/auth.ts` file with this:
```
//config/auth.ts

  import { configProvider } from '@adonisjs/core'
  ... other imports

  ...
      provider: configProvider.create(async () => {
        const { SessionPrismaUserProvider } = await import(
          '@arthurfranckpat/adonis-prisma/prisma_user_provider'
        )
        return new SessionPrismaUserProvider()
      })
```

After that, you can use the provided methods to facilitate the authentication flow. Like, the `@adonisjs/lucid`, there is two methods for authentication (NB : these methods are available only with `user` model : 
- To verify user credentials, you can use this method : ` const user = await prisma.user.verifyCredentials('email', 'password')`


#### Notes on authentication :
- First, you should have a `user` model define to have access to user methods
- You configure the `auth` behavior inside `config/prisma.ts` : You can modify the `uuids` and `pasword` columns names to fit your needs. If you define many `uuids` column, you can use the `findForAuth` method to query the user in the database.
- The password is automatically hashed via the `@adonisjs/hash` package when creating or updating an user, based on the default hasher configured inside the `config/hash.ts`.
- In  `config/prisma.ts`, you can define whether you want sanitize (remove the hashed from the response returned by prisma). This option is defined via the `sanitizePassword` key.

### Database Seeding

You can define seeders for your DB with the following command : 
```sh
node ace prisma:make-provider <name_of_the_seeder>
```
It will create a seeder file inside the `prisma/seeders` directory.

Then, to seed the database you should run :
`node ace prisma:seed` command. Note: This command runs all the seeders files inside `prisma/seeders` directory.


## Before leaving...
This package is my first ever package. Feel free to make feedbacks if something needs to be improved.
