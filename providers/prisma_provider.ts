import { ApplicationService } from '@adonisjs/core/types'
import { ExtendedPrismaClient, extendedPrismaClient } from '../src/prisma_service.js'
import { HttpContext } from '@adonisjs/core/http'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    'prisma:db': ExtendedPrismaClient
  }
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    prisma: ExtendedPrismaClient
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
  async boot() {
    const prismaDb = await this.app.container.make('prisma:db')
    HttpContext.getter('prisma', function (this: HttpContext) {
      return prismaDb
    })
  }

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
