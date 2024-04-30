import type { ExtendedPrismaClient } from './prisma_service.js'

export interface PrismaAuthConfigOptions {
  uids: string[]
  passwordColumnName: string
}

export type PrismaConfigOptions = DialectConfig & {
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

type SupportedDialectsType = 'sqlite' | 'mysql' | 'postgres' | 'mssql'

type DialectConfig = {
  connection: SupportedDialectsType
  connections: {
    [key: string]: SqliteConfig | PostgresConfig | MySqlConfig | MsSqlConfig
  }
}

type SqliteConfig = {
  filename: string
}
type PostgresConfig = {
  host: string
  port: number
  user: string
  password: string
  database: string
}
type MySqlConfig = {
  host: string
  port: number
  user: string
  password: string
  database: string
}
type MsSqlConfig = {
  host: string
  port: number
  user: string
  password: string
  database: string
}

// connection : 'sqlite',
//     connections : {
//         sqlite : {
//             filename:  app.tmpPath('dev.db')
//         }
//     },
