import { ApplicationService } from '@adonisjs/core/types'
import { ExtendedPrismaClient, extendedPrismaClient } from '../src/prisma_service.js'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    'prisma:db': ExtendedPrismaClient
  }
}

export default class PrismaProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {
    this.app.container.singleton('prisma:db', async () => {
      return extendedPrismaClient
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
    this.app.container.resolving('prisma:db', (prisma) => {
      return prisma.$disconnect()
    })
  }
}
