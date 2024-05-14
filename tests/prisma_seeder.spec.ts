import { test } from '@japa/runner'
import { createFakeAdonisApp, createFiles } from '../test-helpers/index.js'
import { PrismaSeeder } from '../src/prisma_seeder.js'

test.group('Prisma Seeder', (group) => {
  group.tap((t) => t.timeout(20_000))
  group.each.setup(async ({ context }) => {
    await createFiles(context.fs)
  })
  group.each.teardown(async ({ context }) => {
    await context.fs.cleanup()
  })
  test('register prisma seeder command', async ({ fs, assert, cleanup }) => {
    const { ace } = await createFakeAdonisApp({})
    // ace.ui.switchMode('raw')
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

    // cleanup(() => {
    //   fs.remove('prisma/seeders/user_seeder.ts')
    // })
  })
  test('run prisma seeder command', async ({ fs, assert }) => {
    const { ace, app } = await createFakeAdonisApp({})
    // ace.ui.switchMode('raw')
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
    const { ace, app } = await createFakeAdonisApp({})
    // ace.ui.switchMode('raw')

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
    const seeder = new PrismaSeeder(app)
    const files = await seeder.getList()

    const report = await seeder.run(files[0])
    const fileSource = await report.file.getSource()

    assert.equal((fileSource as any)['invoked'], true)
    assert.equal(report.status, 'completed')
  })

  test('catch and return seeder errors', async ({ fs, assert }) => {
    const { ace, app } = await createFakeAdonisApp({})
    // ace.ui.switchMode('raw')

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

    const seeder = new PrismaSeeder(app)
    const files = await seeder.getList()

    const report = await seeder.run(files[0])
    assert.equal(report.status, 'failed')
    assert.exists(report.error)
  })
})
