import { test } from '@japa/runner'
import { createFakeAdonisApp, createFiles } from '../test-helpers/index.js'

import { AceFactory } from '@adonisjs/core/factories'
import { PrismaMakeSeeder } from '../commands/prisma_make_seeder.js'

test.group('Prisma Seeder', (group) => {
  group.tap((t) => t.timeout(20_000))
  group.each.setup(async ({ context }) => {
    await createFiles(context.fs)
  })
  test('register prisma seeder command', async ({ fs, assert }) => {
    const ace = await new AceFactory().make(fs.baseUrl, { importer: () => {} })
    await ace.app.init()
    ace.ui.switchMode('raw')
    const command = await ace.create(PrismaMakeSeeder, ['post', 'true'])
    await command.exec()

    await assert.fileExists('prisma/seeders/user_seeder.ts')
    await assert.fileContains(
      'prisma/seeders/user_seeder.ts',
      `export default class UserSeeder extends PrismaSeederBase`
    )
  }).pin()
})
