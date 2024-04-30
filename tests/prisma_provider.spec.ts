import { test } from '@japa/runner'
import { createFakeAdonisApp, createFiles } from '../test-helpers/index.js'
import Configure from '@adonisjs/core/commands/configure'
import { defineConfig } from '../src/define_config.js'
import { extendedPrismaClient } from '../src/prisma_service.js'
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

test.group('Prisma Provider', (group) => {
  group.tap((t) => t.timeout(20_000))
  group.each.setup(async ({ context }) => {
    await createFiles(context.fs)
  })
  test('register prisma provider', async ({ fs, assert }) => {
    await fs.create('.env', '')
    await fs.create('start/env.ts', `export default Env.create(new URL('./'), {})`)

    const { app, ace } = await createFakeAdonisApp({
      rcFileContents: {
        providers: [() => import('../providers/prisma_provider.js')],
      },
      config: {
        prisma: defineConfig({
          connection: 'sqlite',
          connections: {
            sqlite: {
              filename: new URL('./tmp/dev.db', import.meta.url).href,
            },
          },
          auth: {
            uids: ['email'],
            passwordColumnName: 'password',
          },
        }),
      },
    })
    // app.container.swap(PrismaClient, () => prismaMock)
    ace.prompt.trap('dialect').replyWith('postgres')
    ace.prompt.trap('shouldInstallPackages').accept()
    const command = await ace.create(Configure, ['../../index.js'])
    await command.exec()

    assert.fileExists('prisma/schema.prisma')
    assert.dirExists('node_modules/@prisma/client')
    // mockDeep<PrismaClient>()
    const { PrismaClient: FakePrismaClient } = await import('@prisma/client')
    app.container.swap(PrismaClient, PrismaClient)
    assert.isTrue(app.container.hasBinding('prisma:db'))
    const prisma = await app.container.make('prisma:db')
    console.log(prisma)
    assert.instanceOf(await app.container.make('prisma:db'), FakePrismaClient)
  })
})

// const prisma = await app.container.make('prisma')
