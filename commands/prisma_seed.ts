import { BaseCommand, args } from '@adonisjs/core/ace'
import { PrismaSeederFile, PrismaSeederStatus } from '../src/types.js'

export class PrismaSeed extends BaseCommand {
  static commandName: 'prisma:seed'

  // @args.string({
  //   parse(input) {
  //     return `${input.toLowerCase()}_seeder.ts`
  //   },
  // })
  // declare fileName: string

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
    let hasError = false

    for (let file of files) {
      const response = await seeder.run(file)
      if (response.status === 'failed') {
        hasError = true
      }
      this.#printLogMessage(response)
    }
  }

  async completed() {}
}
