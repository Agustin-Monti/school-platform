import NextAuth, { type DefaultSession } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@school/database'
import { compare } from 'bcryptjs'
import type { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      schoolId: string
    } & DefaultSession['user']
  }

  interface User {
    role: UserRole
    schoolId: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    schoolId: string
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciales inválidas')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          throw new Error('Credenciales inválidas')
        }

        const isValid = await compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          throw new Error('Credenciales inválidas')
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.name} ${user.lastName}`,
          role: user.role,
          schoolId: user.schoolId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.schoolId = user.schoolId
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.schoolId = token.schoolId
        session.user.id = token.id as string
      }
      return session
    },
  },
})