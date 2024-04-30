import { IgnitorFactory } from '@adonisjs/core/factories'
import { Logger } from '@adonisjs/core/logger'
import { FileSystem } from '@japa/file-system'

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
  //   ace.ui.switchMode('raw')

  return { app, ace }
}

export async function createFiles(fs: FileSystem) {
  await fs.createJson('package.json', {})
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
