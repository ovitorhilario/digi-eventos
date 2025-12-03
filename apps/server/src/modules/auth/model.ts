import { t } from 'elysia'

export namespace AuthModel {
	// Login
	export const loginBody = t.Object({
		email: t.String({ format: 'email' }),
		password: t.String(),
	})

	export type loginBody = typeof loginBody.static

	export const loginResponse = t.Object({
		user: t.Object({
			id: t.String(),
			email: t.String(),
			name: t.String(),
			role: t.String(),
			avatarUrl: t.Optional(t.Union([t.String(), t.Null()])), // Image URL (output)
		}),
		accessToken: t.String(),
	})

	export type loginResponse = typeof loginResponse.static

	export const loginInvalid = t.Literal('Email ou senha inválidos')
	export type loginInvalid = typeof loginInvalid.static

	// Me
	export const meResponse = t.Object({
		user: t.Object({
			id: t.String(),
			email: t.String(),
			name: t.String(),
			role: t.String(),
			avatarUrl: t.Optional(t.Union([t.String(), t.Null()])), // Image URL (output)
		}),
		accessToken: t.String(),
	})

	export type meResponse = typeof meResponse.static

	export const meInvalid = t.Literal('Usuário não encontrado')
	export type meInvalid = typeof meInvalid.static
}