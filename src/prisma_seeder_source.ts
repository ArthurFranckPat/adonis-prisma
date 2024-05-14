import { ApplicationService } from '@adonisjs/core/types'

export class SeederSource {
  constructor(
    protected app: ApplicationService,
    protected config: string
  ) {}
}
