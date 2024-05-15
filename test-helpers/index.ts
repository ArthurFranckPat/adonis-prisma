import { IgnitorFactory } from '@adonisjs/core/factories'
import { Logger } from '@adonisjs/core/logger'
import { ApplicationService } from '@adonisjs/core/types'
import { FileSystem } from '@japa/file-system'
import { execa } from 'execa'
import { PrismaSeeder } from '../src/prisma_seeder.js'

export const BASE_URL = new URL('./tmp/', import.meta.url)
export const logger = new Logger({})

export async function createFakeAdonisApp(args: {} = {}) {
  const ignitor = new IgnitorFactory()
    .merge(args)
    .withCoreProviders()
    .withCoreConfig()
    .create(BASE_URL, {
      importer: (filePath) => {
        if (filePath.startsWith('./') || filePath.startsWith('../')) {
          return import(new URL(filePath, BASE_URL).href)
        }

        return import(filePath)
      },
    })
  const app = ignitor.createApp('web')
  await app.init()
  await app.boot()

  const ace = await app.container.make('ace')
  ace.ui.switchMode('normal')

  return { app, ace }
}

export async function createFiles(fs: FileSystem) {
  await fs.createJson('package.json', {
    type: 'module',
  })
  await fs.createJson('tsconfig.json', {})
  await fs.create('adonisrc.ts', `export default defineConfig({})`)
  await fs.create(
    'start/kernel.ts',
    `
      import router from '@adonisjs/core/services/router'
      import server from '@adonisjs/core/services/server'
  
      router.use([
        () => import('@adonisjs/core/bodyparser_middleware'),
      ])
  
      server.use([])
    `
  )
}

export async function createFilesWithPrisma(fs: FileSystem) {
  await createFiles(fs)
  // await fs.create('.env')
  // await fs.create('database/dev.db', '')
  await fs.create(
    'prisma/schema.prisma',
    `
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  generator client {
    provider        = "prisma-client-js"
    previewFeatures = ["driverAdapters"]
}

  model User {
    id        Int      @id @default(autoincrement())
    createdAt DateTime @default(now())
    email     String   @unique
    password  String
    name      String
  }
  `
  )
}

export async function setupDatabaseForTest(fs: FileSystem, cwd: string) {
  await fs.create(
    '.env',
    'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/prisma?connect_timeout=3000&pool_timeout=30&socket_timeout=30"'
  )

  // await execa({ cwd })`npx prisma migrate dev`
  await execa({ cwd })`npx prisma db push`
}

export async function cleanupDatabase(cwd: string) {
  await execa({ cwd })`npx prisma migrate reset --skip-generate --force`
}

export async function fakeSeederFile(fs: FileSystem) {
  await fs.create(
    'prisma/seeders/user_seeder.ts',
    `
    import { PrismaClient } from '@prisma/client'
    
  const prisma = new PrismaClient()
  export default class UserSeeder {
    async run() {
      
      await prisma.user.createMany({
        data: [
          {
            name: 'John Doe',
            email: 'C9Ykz@example.com',
            password: '123456',
          },
          {
            name: 'Jane Doe',
            email: 'C10Ykz@example.com',
            password: '123456',
          },
          {
            name: 'Jack Doe',
            email: 'C11Ykz@example.com',
            password: '123456',
          },
        ]
      })

      
      console.log('db seeded')

    }
  }
  `
  )
}

export async function seedDatabase(app: ApplicationService) {
  const seeder = new PrismaSeeder(app)
  const files = await seeder.getList()
  return seeder.run(files[0])
}
