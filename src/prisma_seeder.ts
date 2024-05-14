import { PrismaSeederConstructorContract, PrismaSeederFile, PrismaSeederStatus } from './types.js'
import { ApplicationService } from '@adonisjs/core/types'
import { sourceFiles } from './utils.js'

export class PrismaSeeder {
  constructor(private app: ApplicationService) {}

  async #getSeederSource(file: PrismaSeederFile<unknown>) {
    const source = await file.getSource()
    if (typeof source === 'function') {
      return source as PrismaSeederConstructorContract
    }
    throw new Error(`Invalid schema class exported by "${file.name}"`)
  }
  async getList(): Promise<PrismaSeederFile<unknown>[]> {
    const prismaSeedersDirPath = new URL('prisma/seeders', this.app.appRoot).pathname
    const { files } = await sourceFiles(this.app.appRoot, prismaSeedersDirPath, false)
    return files
  }

  async run(file: PrismaSeederFile<unknown>): Promise<PrismaSeederStatus> {
    const Source = await this.#getSeederSource(file)
    const seeder: PrismaSeederStatus = {
      status: 'pending',
      file,
    }

    if (Source.developmentOnly && !this.app.inDev) {
      seeder.status = 'ignored'
      return seeder
    }
    try {
      const seederInstance = new Source()
      if (typeof seederInstance.run !== 'function') {
        throw new Error(`Missing method "run" on "${seeder.file.name}" seeder`)
      }

      await seederInstance.run()
      seeder.status = 'completed'
    } catch (error) {
      seeder.status = 'failed'
      seeder.error = error
    }
    return seeder
  }

  async close() {}
}
