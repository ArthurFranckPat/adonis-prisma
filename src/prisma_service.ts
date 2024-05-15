import { Hash } from '@adonisjs/core/hash'
import { RuntimeException } from '@adonisjs/core/exceptions'
import app from '@adonisjs/core/services/app'
import { E_INVALID_CREDENTIALS } from './errors.js'
import { PrismaConfigOptions } from './types.js'
import hash from '@adonisjs/core/services/hash'

const { Prisma, PrismaClient } = async () => (await import('@prisma/client')).default

const prisma = new PrismaClient()
const withAuthFinder = (
  _hash: () => Hash,
  options: {
    uids: string[]
    passwordColumnName: string
  }
) =>
  Prisma.defineExtension({
    model: {
      user: {
        findForAuth(uids: string[], value: string) {
          return prisma.user.findFirst({
            where: {
              OR: [...uids.map((uid) => ({ [uid]: value }))],
            },
          })
        },
        

        async hashPassword(user: any) {
          return prisma.user.update({
            where: {
              id: (user as any)[options.uids[0]],
            },
            data: {
              [options.passwordColumnName]: await _hash().make(
                (user as any)[options.passwordColumnName]
              ),
            },
          })
        },

        async verifyCredentials(uid: any, password: string) {
          if (!uid || !password) {
            throw new E_INVALID_CREDENTIALS('Invalid user credentials')
          }

          const user = await this.findForAuth(options.uids, uid)
          if (!user) {
            await _hash().make(password)
            throw new E_INVALID_CREDENTIALS('Invalid user credentials')
          }

          const passwordHash = (user as any)[options.passwordColumnName]
          if (!passwordHash) {
            throw new RuntimeException(
              `Cannot verify password during login. The value of column "${options.passwordColumnName}" is undefined or null`
            )
          }

          if (await _hash().verify(passwordHash, password)) {
            return user
          }

          throw new E_INVALID_CREDENTIALS('Invalid user credentials')
        },
      },
    },
  })

const hashConfig = app.config.get<any>('hash')
const prismaConfig = app.config.get<PrismaConfigOptions>('prisma')

const extendedPrismaClient = prisma.$extends(
  withAuthFinder(() => hash.use(hashConfig.default), prismaConfig.auth)
)

type ExtendedPrismaClient = typeof extendedPrismaClient

export { extendedPrismaClient, type ExtendedPrismaClient }
