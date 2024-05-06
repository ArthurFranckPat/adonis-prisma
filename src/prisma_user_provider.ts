import { symbols } from '@adonisjs/auth'
import { SessionGuardUser, SessionUserProviderContract } from '@adonisjs/auth/types/session'
import app from '@adonisjs/core/services/app'

type Users = {
  id: string | number
}

const db = await app.container.make('prisma:db')

export class SessionPrismaUserProvider implements SessionUserProviderContract<Users> {
  declare [symbols.PROVIDER_REAL_USER]: Users

  async createUserForGuard(user: Users): Promise<SessionGuardUser<Users>> {
    return {
      getId() {
        return user.id
      },
      getOriginal() {
        return user
      },
    }
  }

  async findById(identifier: string | number): Promise<SessionGuardUser<Users> | null> {
    const user = await db.user.findUnique({
      where: { id: identifier },
    })

    if (!user) {
      return null
    }

    return this.createUserForGuard(user)
  }
}
