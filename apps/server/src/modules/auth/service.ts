import { db, users } from "@digi-eventos/db";
import { eq } from "drizzle-orm";
import { signAccessToken, signRefreshToken } from "../../middleware/auth";
import type { AuthModel } from './model'
import { AppError } from '../../lib/errors'

export abstract class AuthService {

	static async login({ email, password }: AuthModel.loginBody): Promise<AuthModel.loginResponse> {
		// Busca o usuário pelo email
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (!user) {
			throw new AppError('LOGIN_INVALID', 'Email ou senha inválidos', 401)
		}

		// Verifica a senha usando Bun.password
		const isValidPassword = await Bun.password.verify(
			password,
			user.password,
		);

		if (!isValidPassword) {
			throw new AppError('LOGIN_INVALID', 'Email ou senha inválidos', 401)
		}

		// Gera o token JWT
		const accessToken = await signAccessToken({
			userId: user.id,
			email: user.email,
			role: user.role,
		});

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
				avatarUrl: user.avatarUrl,
			},
			accessToken,
		};
	}

	static async getUserById(id: string): Promise<AuthModel.meResponse> {
		// Busca os dados atualizados do usuário
		const [user] = await db
			.select({
				id: users.id,
				email: users.email,
				name: users.name,
				role: users.role,
				avatarUrl: users.avatarUrl,
			})
			.from(users)
			.where(eq(users.id, id))
			.limit(1);

		if (!user) {
			throw new AppError('NOT_FOUND', 'Usuário não encontrado', 404)
		}

		// Generate new access token
		const accessToken = await signAccessToken({
			userId: user.id,
			email: user.email,
			role: user.role,
		});

		return { 
			user,
			accessToken,
		};
	}

	static async refreshTokens(userId: string): Promise<{ accessToken: string; refreshToken: string; user: any }> {
		const [user] = await db
			.select({
				id: users.id,
				email: users.email,
				name: users.name,
				role: users.role,
				avatarUrl: users.avatarUrl,
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) {
			throw new AppError('NOT_FOUND', 'Usuário não encontrado', 404)
		}

		// Generate new tokens
		const accessToken = await signAccessToken({
			userId: user.id,
			email: user.email,
			role: user.role,
		});

		const refreshToken = await signRefreshToken({
			userId: user.id,
			email: user.email,
			role: user.role,
		});

		return {
			accessToken,
			refreshToken,
			user,
		};
	}
}