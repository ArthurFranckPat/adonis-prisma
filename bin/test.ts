import { assert } from '@japa/assert'
import { fileSystem } from '@japa/file-system'
import { configure, processCLIArgs, run } from '@japa/runner'
import { BASE_URL } from '../test-helpers/index.js'
import * as reporters from '@japa/runner/reporters'

processCLIArgs(process.argv.splice(2))

configure({
  files: ['tests/**/*.spec.ts'],
  plugins: [assert(), fileSystem({ basePath: BASE_URL })],
  reporters: {
    activated: ['spec'],
    list: [reporters.spec(), reporters.ndjson(), reporters.dot()],
  },
})

run()
