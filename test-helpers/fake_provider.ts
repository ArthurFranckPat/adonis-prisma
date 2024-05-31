import { ApplicationService } from '@adonisjs/core/types'
import type { PrismaClient } from '@prisma/client'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    //@ts-ignore
    'prisma:db': PrismaClient
  }
}

export default class FakePrismaProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {
    //@ts-ignore
    this.app.container.singleton('prisma:db', async () => {
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
    //@ts-ignore
    this.app.container.resolving('prisma:db', (prisma) => {
      return prisma.$disconnect()
    })
  }
}
