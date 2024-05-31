import { BaseCommand } from '@adonisjs/core/ace'
import { PrismaSeederFile, PrismaSeederStatus } from '../src/types.js'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class PrismaSeed extends BaseCommand {
  static commandName = 'prisma:seed'
  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const { PrismaSeeder } = await import('../src/prisma_seeder.js')
    const seeder = new PrismaSeeder(this.app)
    let files: PrismaSeederFile<unknown>[] = []
    try {
      files = await seeder.getList()
    } catch (error) {
      this.logger.error(error)
      this.exitCode = 1
      return
    }

    for (let file of files) {
      const response = await seeder.run(file)
      this.#printLogMessage(response)
    }
  }

  async completed() {}

  #printLogMessage(file: PrismaSeederStatus) {
    const colors = this.colors

    let color: keyof typeof colors = 'gray'
    let message: string = ''
    let prefix: string = ''

    switch (file.status) {
      case 'pending':
        message = 'pending  '
        color = 'gray'
        break
      case 'failed':
        message = 'error    '
        prefix = file.error!.message
        color = 'red'
        break
      case 'ignored':
        message = 'ignored  '
        prefix = 'Enabled only in development environment'
        color = 'dim'
        break
      case 'completed':
        message = 'completed'
        color = 'green'
        break
    }

    console.log(`${colors[color]('❯')} ${colors[color](message)} ${file.file.name}`)
    if (prefix) {
      console.log(`  ${colors[color](prefix)}`)
    }
  }
}
