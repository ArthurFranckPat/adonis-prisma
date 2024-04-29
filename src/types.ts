import type { ExtendedPrismaClient } from './prisma_service.js'

export interface PrismaAuthConfigOptions {
  uids: string[]
  passwordColumnName: string
}

export type PrismaConfigOptions = {
  auth: PrismaAuthConfigOptions
}

export type PrismaClient = ExtendedPrismaClient

export type PrismaSeederConstructorContract = {
  developmentOnly: boolean
  new (): {
    run(): Promise<void>
  }
}

export interface PrismaSeederFile {
  absolutePath: string
  name: string
  getSource: () => unknown
}

export abstract class PrismaSeederBase {
  static developmentOnly: boolean
  abstract run(): Promise<unknown>
}
