import { test } from '@japa/runner'
import {
  cleanupDatabase,
  createFakeAdonisApp,
  createFiles,
  createFilesWithPrisma,
  fakeSeederFile,
  seedDatabase,
  setupDatabaseForTest,
} from '../test-helpers/index.js'
import { PrismaSeeder } from '../src/prisma_seeder.js'

test.group('Prisma Seeder', (group) => {
  group.each.disableTimeout()
  group.each.setup(async ({ context }) => {
    await createFiles(context.fs)
  })

  test('register prisma seeder command', async ({ fs, assert }) => {
    await createFakeAdonisApp({})
    await fs.create(
      'prisma/seeders/user_seeder.ts',
      `

    export default class UserSeeder {
      static developmentOnly = true

      async run() {
        // Write your database queries inside the run method
      }
    }
    `
    )

    await assert.fileExists('prisma/seeders/user_seeder.ts')
    await assert.fileContains('prisma/seeders/user_seeder.ts', `export default class UserSeeder`)
  })
  test('run prisma seeder command', async ({ fs, assert }) => {
    const { app } = await createFakeAdonisApp({})
    await fs.create(
      'prisma/seeders/user_seeder.ts',
      `

    export default class UserSeeder {
      static developmentOnly = true

      async run() {
        // Write your database queries inside the run method
      }
    }
    `
    )

    await fs.create(
      'prisma/seeders/post_seeder.ts',
      `
    export default class PostSeeder {
      static developmentOnly = false

      async run() {
        // Write your database queries inside the run method
      }
    }
    `
    )
    await assert.fileExists('prisma/seeders/user_seeder.ts')
    await assert.fileExists('prisma/seeders/post_seeder.ts')

    const seeder = new PrismaSeeder(app)
    const files = await seeder.getList()

    assert.equal(files.length, 2)
    assert.equal(files[1].name, 'user_seeder')
    assert.equal(files[0].name, 'post_seeder')
  })

  test('It completes seeder file in production mode', async ({ fs, assert }) => {
    const { app } = await createFakeAdonisApp({})

    await fs.create(
      'prisma/seeders/user_seeder.ts',
      `

    export default class UserSeeder {
      static developmentOnly = false
      static invoked = false
      async run() {
        (this.constructor as any).invoked = true
      }
    }
    `
    )
    const report = await seedDatabase(app)
    const fileSource = await report.file.getSource()

    assert.equal((fileSource as any)['invoked'], true)
    assert.equal(report.status, 'completed')
  })

  test('catch and return seeder errors', async ({ fs, assert }) => {
    const { app } = await createFakeAdonisApp({})

    await fs.create(
      'prisma/seeders/user_seeder.ts',
      `

    export default class UserSeeder {
      async run() {
        throw new Error('Failed')
      }
    }
    `
    )

    const report = await seedDatabase(app)
    assert.equal(report.status, 'failed')
    assert.exists(report.error)
  })

  test('Check if database is seeded', async ({ assert, fs, cleanup }) => {
    const { app } = await createFakeAdonisApp({
      rcFileContents: {
        providers: [() => import('../test-helpers/fake_provider.js')],
      },
    })

    await createFilesWithPrisma(fs)
    await setupDatabaseForTest(fs, app.makePath())
    await fakeSeederFile(fs)
    const report = await seedDatabase(app)

    assert.equal(report.status, 'completed')

    const prisma = await app.container.make('prisma:db')
    const users = await prisma.user.findMany()

    assert.equal(users.length, 3)

    cleanup(async () => await cleanupDatabase(app.makePath()))
  }).pin()
})
