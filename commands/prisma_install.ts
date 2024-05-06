import { BaseCommand } from '@adonisjs/core/ace'
import { exec } from 'child_process'

export class PrismaInstall extends BaseCommand {
  public static commandName = 'prisma:install'

  async run() {
    exec('prisma generate', () => console.log('prisma client generated'))
  }
}
