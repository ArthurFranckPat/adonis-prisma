import { test } from '@japa/runner'
import { createFakeAdonisApp, createFiles } from '../test-helpers/index.js'
import Configure from '@adonisjs/core/commands/configure'

test.group('Configure', (group) => {
  group.tap((t) => t.timeout(20_000))
  group.each.setup(async ({ context }) => {
    await createFiles(context.fs)
  })
  test('create config file and register provider', async ({ fs, assert }) => {
    await fs.create('.env', '')
    await fs.create('start/env.ts', `export default Env.create(new URL('./'), {})`)

    const { ace } = await createFakeAdonisApp()
    ace.prompt.trap('dialect').replyWith('postgres')
    ace.prompt.trap('shouldInstallPackages').reject()
    const command = await ace.create(Configure, ['../../index.js'])
    await command.exec()

    await assert.fileExists('config/prisma.ts')
    await assert.fileExists('adonisrc.ts')
    await assert.fileExists('.env')
    await assert.fileExists('prisma/schema.prisma')
    // await assert.fileContains('adonisrc.ts', '@arthurfranckpat/adonis-prisma/commands')
    await assert.fileContains('adonisrc.ts', '@arthurfranckpat/adonis-prisma/prisma_provider')
    await assert.fileContains('config/prisma.ts', 'defineConfig({')
    assert.fileContains('prisma/schema.prisma', `model User {`)

    await assert.fileContains('.env', 'DB_HOST')
    await assert.fileContains('.env', 'DB_PORT')
    await assert.fileContains('.env', 'DB_USER')
    await assert.fileContains('.env', 'DB_PASSWORD')
    await assert.fileContains('.env', 'DB_DATABASE')
    await assert.fileContains('.env', 'DATABASE_URL')

    await assert.fileContains('start/env.ts', `DB_HOST: Env.schema.string({ format: 'host' })`)
    await assert.fileContains('start/env.ts', 'DB_PORT: Env.schema.number()')
    await assert.fileContains('start/env.ts', 'DB_USER: Env.schema.string()')
    await assert.fileContains('start/env.ts', 'DB_PASSWORD: Env.schema.string.optional()')
    await assert.fileContains('start/env.ts', 'DB_DATABASE: Env.schema.string()')
    await assert.fileContains('start/env.ts', 'DATABASE_URL: Env.schema.string()')
  })
  test('Do not define env variables for dialect sqlite', async ({ assert, fs }) => {
    const { ace } = await createFakeAdonisApp()
    ace.prompt.trap('dialect').replyWith('sqlite')
    ace.prompt.trap('shouldInstallPackages').reject()
    const command = await ace.create(Configure, ['../../index.js'])
    await command.exec()

    await assert.fileNotExists('.env')
    await assert.fileNotExists('start/env.ts')

    await assert.fileExists('config/prisma.ts')
    await assert.fileExists('adonisrc.ts')
    await assert.fileContains('adonisrc.ts', '@arthurfranckpat/adonis-prisma/prisma_provider')
    await assert.fileContains('config/prisma.ts', 'defineConfig({')
    assert.fileContains('prisma/schema.prisma', `model User {`)
  })
  test('create temp dir for sqlite and dev.db file', async ({ assert, fs }) => {
    const { ace } = await createFakeAdonisApp()
    ace.prompt.trap('dialect').replyWith('sqlite')
    ace.prompt.trap('shouldInstallPackages').reject()
    const command = await ace.create(Configure, ['../../index.js'])
    await command.exec()

    await assert.dirExists('tmp')
    await assert.fileExists('tmp/dev.db')
  })
  test('do not recreate tmp directory if it already exists', async ({ assert, fs }) => {
    const { ace } = await createFakeAdonisApp()
    ace.prompt.trap('dialect').replyWith('sqlite')
    ace.prompt.trap('shouldInstallPackages').reject()
    const command = await ace.create(Configure, ['../../index.js'])
    await command.exec()

    await fs.createJson('tsconfig.json', {})
    await fs.create('adonisrc.ts', `export default defineConfig({})`)
    await fs.create('tmp/dev.db', '')

    await assert.fileExists('tmp/dev.db')
  })
})
