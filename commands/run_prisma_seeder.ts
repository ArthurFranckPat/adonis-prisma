import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import { fsReadAll } from '@adonisjs/core/helpers'

export default class RunPrismaSeeder extends BaseCommand {
  static commandName = 'run:prisma-seeder'
  static description = 'Run Prisma seeder files'

  async run() {
    const codemods = await this.createCodemods()
    const seederFiles = await fsReadAll(new URL('./prisma/seeders', import.meta.url), {
      filter(filePath) {
        return filePath.includes('_seeder.ts')
      },
      pathType: 'url',
    })
  }
}
