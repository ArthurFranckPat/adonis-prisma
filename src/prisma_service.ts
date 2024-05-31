import { Hash } from '@adonisjs/core/hash'
import { RuntimeException } from '@adonisjs/core/exceptions'
import app from '@adonisjs/core/services/app'
import { E_INVALID_CREDENTIALS } from './errors.js'
import { PrismaConfigOptions } from './types.js'
import hash from '@adonisjs/core/services/hash'
import { Prisma, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const withAuthFinder = (
  _hash: () => Hash,
  options: {
    uids: string[]
    passwordColumnName: string
    sanitizePassword: boolean
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

    query: {
      user: {
        async create({ args, query }) {
          args.data = { ...args.data, password: await _hash().make(args.data.password) }
          return query(args)
        },
        async update({ args, query }) {
          args.data = {
            ...args.data,
            password: args.data.password && (await _hash().make(args.data.password as string)),
          }
          return query(args)
        },

        async findFirst({ args, query }) {
          const user = await query(args)
          if (options.sanitizePassword) delete user?.password
          return user
        },
        async findFirstOrThrow({ args, query }) {
          const user = await query(args)
          if (options.sanitizePassword) delete user.password
          return user
        },
        async findUnique({ args, query }) {
          const user = await query(args)
          if (options.sanitizePassword) delete user?.password
          return user
        },
        async findUniqueOrThrow({ args, query }) {
          const user = await query(args)
          if (options.sanitizePassword) delete user.password
          return user
        },
        async findMany({ args, query }) {
          const users = await query(args)
          users.forEach((user) => {
            if (options.sanitizePassword) delete user.password
          })
          return users
        },
      },
    },
    result: {
      user: {},
    },
  })

const hashConfig = app.config.get<any>('hash')
const prismaConfig = app.config.get<PrismaConfigOptions>('prisma')

const extendedPrismaClient = prisma.$extends(
  withAuthFinder(() => hash.use(hashConfig.default), prismaConfig.auth)
)

type ExtendedPrismaClient = typeof extendedPrismaClient

export { extendedPrismaClient, type ExtendedPrismaClient }
