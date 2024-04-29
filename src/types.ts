import type { ExtendedPrismaClient } from './prisma_service.js'

export interface PrismaAuthConfigOptions {
  uids: string[]
  passwordColumnName: string
}

export type PrismaConfigOptions = {
  auth: PrismaAuthConfigOptions
}

export type PrismaClient = ExtendedPrismaClient
