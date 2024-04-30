import { ApplicationService } from '@adonisjs/core/types'
import { ExtendedPrismaClient, extendedPrismaClient } from '../src/prisma_service.js'
import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    // prisma: ExtendedPrismaClient
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
      const { PrismaClient } = await import('@prisma/client')
      return new PrismaClient()
    })

    this.app.container.alias('prisma:db', PrismaClient)
    console.log('registered')
  }

  /**
   * The container bindings have booted
   */
  async boot() {
    console.log('booted')
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
    this.app.container.resolving('prisma', (prisma) => {
      return prisma.$disconnect()
    })
  }
}
