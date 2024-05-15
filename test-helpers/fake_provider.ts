import { ApplicationService } from '@adonisjs/core/types'
import type { PrismaClient } from '@prisma/client'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    'prisma:db:fake': PrismaClient
  }
}

export default class FakePrismaProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {
    this.app.container.singleton('prisma:db:fake', async () => {
      const { PrismaClient } = await import('@prisma/client')
      return new PrismaClient()
    })
  }

  /**
   * The container bindings have booted
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {}

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {
    this.app.container.resolving('prisma:db:fake', (prisma) => {
      return prisma.$disconnect()
    })
  }
}
