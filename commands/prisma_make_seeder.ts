import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import { stubsRoot } from '../index.js'

export default class PrismaMakeSeeder extends BaseCommand {
  static commandName = 'prisma:make-seeder'

  @args.string({ description: 'Name of the seeder class' })
  declare name: string

  @flags.boolean({
    alias: ['D', 'd'],
    default: false,
  })
  declare developmentOnly: boolean

  async run() {
    const codemods = await this.createCodemods()
    codemods.makeUsingStub(stubsRoot, 'commands/make_seeder.stub', {
      name: this.name,
      developmentOnly: this.developmentOnly,
    })
  }

  async completed() {}
}
