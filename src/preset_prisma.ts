/*
 * @adonisjs/presets
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { joinToURL } from '@poppinss/utils'
import type { Application } from '@adonisjs/core/app'
import type { Codemods } from '@adonisjs/core/ace/codemods'
import { execSync } from 'node:child_process'

export const STUBS_ROOT = joinToURL(import.meta.url, '../stubs')

/**
 * Collection of dialects that can be configured
 */
export const DIALECTS: {
  [K in 'sqlite' | 'mysql' | 'postgres' | 'mssql']: {
    envVars?: Record<string, number | string>
    envValidations?: Record<string, string>
    name: string
    pkgs?: { name: string; isDevDependency: boolean }[]
  }
} = {
  sqlite: {
    name: 'SQLite',
    pkgs: [{ name: 'better-sqlite3', isDevDependency: false }],
  },
  mysql: {
    name: 'MySQL',
    // pkgs: [{ name: 'mssql2', isDevDependency: false }],
    envVars: {
      DB_HOST: '127.0.0.1',
      DB_PORT: 3306,
      DB_USER: 'root',
      DB_PASSWORD: '',
      DB_DATABASE: '',
      DATABASE_URL: 'mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}',
    },
    envValidations: {
      DB_HOST: `Env.schema.string({ format: 'host' })`,
      DB_PORT: `Env.schema.number()`,
      DB_USER: 'Env.schema.string()',
      DB_PASSWORD: 'Env.schema.string.optional()',
      DB_DATABASE: 'Env.schema.string()',
      DATABASE_URL: 'Env.schema.string()',
    },
  },
  postgres: {
    name: 'PostgreSQL',
    pkgs: [
      { name: 'pg', isDevDependency: false },
      { name: '@prisma/adapter-pg', isDevDependency: false },
    ],
    envVars: {
      DB_HOST: '127.0.0.1',
      DB_PORT: 5432,
      DB_USER: 'postgres',
      DB_PASSWORD: '',
      DB_DATABASE: '',
      DATABASE_URL: 'postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}',
    },
    envValidations: {
      DB_HOST: `Env.schema.string({ format: 'host' })`,
      DB_PORT: `Env.schema.number()`,
      DB_USER: 'Env.schema.string()',
      DB_PASSWORD: 'Env.schema.string.optional()',
      DB_DATABASE: 'Env.schema.string()',
      DATABASE_URL: 'Env.schema.string()',
    },
  },
  mssql: {
    name: 'MS SQL',
    // pkgs: [{ name: 'tedious', isDevDependency: false }],
    envVars: {
      DB_HOST: '127.0.0.1',
      DB_PORT: 1433,
      DB_USER: 'sa',
      DB_PASSWORD: '',
      DB_DATABASE: '',
      DATABASE_URL:
        'sqlserver://${DB_HOST}:${DB_PORT};database=${DB_DATABASE};user=${DB_USER};password=${DB_PASSWORD};encrypt=true',
    },
    envValidations: {
      DB_HOST: `Env.schema.string({ format: 'host' })`,
      DB_PORT: `Env.schema.number()`,
      DB_USER: 'Env.schema.string()',
      DB_PASSWORD: 'Env.schema.string.optional()',
      DB_DATABASE: 'Env.schema.string()',
      DATABASE_URL: 'Env.schema.string()',
    },
  },
}

/**
 * Configures @adonisjs/lucid package by performing following
 * steps.
 *
 * - Creates config/database.ts file.
 * - Registers lucid commands and provider.
 * - Define env variables and their validations (if any)
 * - Creates tmp directory to store sqlite database file
 * - Installs required packages if(options.installPackages === true)
 */
export async function presetPrisma(
  codemods: Codemods,
  app: Application<any>,
  options: {
    dialect: keyof typeof DIALECTS
    installPackages: boolean
  }
) {
  const { pkgs, envVars, envValidations } = DIALECTS[options.dialect]
  const packagesToInstall = [
    ...pkgs!!,
    // { name: '@prisma/client', isDevDependency: false },
    { name: 'prisma', isDevDependency: true },
  ]

  const DIALECT_PROVIDER = {
    sqlite: 'sqlite',
    mysql: 'mysql',
    postgres: 'postgresql',
    mssql: 'sqlserver',
  }

  /**
   * Publish config file
   */
  await codemods.makeUsingStub(STUBS_ROOT, `config/database/${options.dialect}.stub`, {})

  /**
   * Publish prisma schema file
   */
  await codemods.makeUsingStub(STUBS_ROOT, `schema.stub`, {
    provider: DIALECT_PROVIDER[options.dialect],
  })

  /**
   * Create the "tmp" directory when using sqlite
   */
  if (options.dialect === 'sqlite') {
    try {
      await mkdir(app.tmpPath(), { recursive: true })
      await writeFile(app.tmpPath('dev.db'), '')
    } catch {}
  }

  /**
   * Register commands and provider to the rcfile
   */
  await codemods.updateRcFile((rcFile) => {
    //TODO : create prisma commands wrapper
    rcFile.addCommand('@arthurfranckpat/adonis-prisma/commands')
    rcFile.addProvider('@arthurfranckpat/adonis-prisma/prisma_provider')
  })

  /**
   * Define env variables when selected dialect config
   * needs them
   */
  if (envVars) {
    await codemods.defineEnvVariables(envVars)
  }

  /**
   * Define env variables validations when selected
   * dialect config needs them
   */
  if (envValidations) {
    await codemods.defineEnvValidations({
      variables: envValidations,
      leadingComment: 'Variables for configuring database connection',
    })
  }

  /**
   * Install packages or share instructions to install them
   */
  if (options.installPackages) {
    await codemods.installPackages(packagesToInstall)
    // execSync(`npx prisma init --datasource-provider ${DIALECT_PROVIDER[options.dialect]}`, {
    //   cwd: app.appRoot,
    // }).toString()
    execSync('npx prisma generate', { cwd: app.appRoot })
  } else {
    await codemods.listPackagesToInstall(packagesToInstall)
  }
}
