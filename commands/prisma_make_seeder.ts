import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import { stubsRoot } from '../index.js'

export class PrismaMakeSeeder extends BaseCommand {
  static commandName: 'prisma:make-seeder'
  static description = 'Make a new Prisma Seeder file'

  @args.string({
    parse(input) {
      return `${input.toLowerCase()}_seeder.ts`
    },
  })
  declare fileName: string

  @args.string({ description: 'Name of the seeder class' })
  declare name: string

  @flags.boolean({
    alias: ['D', 'd'],
    default: false,
  })
  declare developmentOnly: boolean

  async run() {
    const codemods = await this.createCodemods()
    codemods.makeUsingStub(stubsRoot, 'commands/make_seeder', {
      name: this.name,
      developmentOnly: this.developmentOnly,
    })
  }

  async completed() {}
}
