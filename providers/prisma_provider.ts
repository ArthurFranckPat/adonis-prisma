import { ApplicationService } from '@adonisjs/core/types'
import { extendedPrismaClient } from '../src/prisma_service.js'
import { PrismaClient } from '@prisma/client'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    'prisma:db': PrismaClient
  }
}

export default class PrismaProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {
    this.app.container.singleton(PrismaClient, async () => {
      return extendedPrismaClient
    })
    // this.app.container.singleton(PrismaClient, async () => {
    //   const { PrismaClient } = await import('@prisma/client')
    //   return await new PrismaClient()
    // })
    this.app.container.alias('prisma:db', PrismaClient)
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
