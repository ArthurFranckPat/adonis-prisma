import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import { STUBS_ROOT } from '../src/preset_prisma.js'

export default class MakePrismaSeeder extends BaseCommand {
  static commandName = 'make:prisma-seeder'
  static description = 'Make a new Prisma seeder file'

  @args.string({
    description: 'Name of the seeder class',
    parse(value) {
      return value.toLowerCase()
    },
  })
  declare name: string

  @flags.boolean({ description: 'Create seeder for development only' })
  declare dev: boolean

  async run() {
    const codemods = await this.createCodemods()
    await codemods.makeUsingStub(STUBS_ROOT, 'commands/make_seeder.stub', {
      name: this.name,
      developmentOnly: Boolean(this.parsed.flags.dev),
    })
  }
}
