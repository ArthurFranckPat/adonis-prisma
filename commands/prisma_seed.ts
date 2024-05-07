import { BaseCommand, args } from '@adonisjs/core/ace'

export class PrismaSeed extends BaseCommand {
  static commandName: 'prisma:seed'

  @args.string({
    parse(input) {
      return `${input.toLowerCase()}_seeder.ts`
    },
  })
  declare fileName: string

  async run() {}

  async completed() {}
}
