import { t } from 'elysia'

export namespace UserModel {
	// Get user profile
	export const getUserProfileResponse = t.Object({
		id: t.String(),
		name: t.String(),
		email: t.String(),
		role: t.String(),
		avatarUrl: t.Optional(t.Union([t.String(), t.Null()])), // Image URL
	})

	export type getUserProfileResponse = typeof getUserProfileResponse.static

	export const userNotFound = t.Literal('Usuário não encontrado')
	export type userNotFound = typeof userNotFound.static

	export const validationError = t.Literal('Dados de validação inválidos')
	export type validationError = typeof validationError.static

	// Update user profile
	export const updateUserProfileBody = t.Object({
		name: t.Optional(t.String()),
		email: t.Optional(t.String()),
		avatar: t.Optional(t.Union([t.String(), t.Null()])), // Base64 encoded image (input)
	})

	export type updateUserProfileBody = typeof updateUserProfileBody.static

	export const updateUserProfileResponse = t.Object({
		id: t.String(),
		name: t.String(),
		email: t.String(),
		role: t.String(),
		avatarUrl: t.Optional(t.Union([t.String(), t.Null()])), // Image URL (output)
	})

	export type updateUserProfileResponse = typeof updateUserProfileResponse.static

	// Create user (admin only)
	export const createUserBody = t.Object({
		email: t.String(),
		name: t.String(),
		password: t.String(),
		role: t.Optional(t.Union([t.Literal('user'), t.Literal('admin'), t.Literal('owner')])),
		avatar: t.Optional(t.Union([t.String(), t.Null()])), // Base64 encoded image (input)
	})

	export type createUserBody = typeof createUserBody.static

	export const createUserResponse = t.Object({
		id: t.String(),
		name: t.String(),
		email: t.String(),
		role: t.String(),
		avatarUrl: t.Optional(t.Union([t.String(), t.Null()])), // Image URL (output)
	})

	export type createUserResponse = typeof createUserResponse.static

	// Get all users (admin only)
	export const getUsersResponse = t.Array(t.Object({
		id: t.String(),
		name: t.String(),
		email: t.String(),
		role: t.String(),
		avatarUrl: t.Optional(t.Union([t.String(), t.Null()])), // Image URL
	}))

	export type getUsersResponse = typeof getUsersResponse.static

	// Change password
	export const changePasswordBody = t.Object({
		currentPassword: t.String(),
		newPassword: t.String(),
		confirmPassword: t.String(),
	})

	export type changePasswordBody = typeof changePasswordBody.static

	export const changePasswordResponse = t.Object({
		message: t.String(),
	})

	export type changePasswordResponse = typeof changePasswordResponse.static

	// Change password by admin (no current password required)
	export const changePasswordByAdminBody = t.Object({
		newPassword: t.String(),
		confirmPassword: t.String(),
	})

	export type changePasswordByAdminBody = typeof changePasswordByAdminBody.static
}
