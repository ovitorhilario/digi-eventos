import Elysia, { t } from 'elysia'
import { UserService } from './service'
import { UserModel } from './model'
import auth from '../../middleware/auth'
import { AppError } from '../../lib/errors'

export const usersModule = new Elysia({ prefix: '/users' })
	.use(auth)
	.get('/', async () => {
		return await UserService.getAllUsers()
	}, {
		auth: { roles: ["admin", "owner"] },
		detail: {
			tags: ['Users'],
			summary: 'Get all users',
			description: 'Get all users (admin/owner only)',
		},
		response: {
			200: UserModel.getUsersResponse,
		}
	})
	.get('/:id', async ({ params: { id } }) => {
		return await UserService.getUserProfile(id)
	}, {
		auth: true,
		detail: {
			tags: ['Users'],
			summary: 'Get user profile',
			description: 'Get user profile by ID',
		},
		response: {
			200: UserModel.getUserProfileResponse,
			404: UserModel.userNotFound,
		}
	})
	.post('/', async ({ body, user }) => {
		// Owners podem criar qualquer tipo de usuário, admins só podem criar users
		if (user.role === 'admin' && body.role === 'admin') {
			throw new AppError('FORBIDDEN', 'Administradores não podem criar outros administradores', 403)
		}
		if (user.role === 'admin' && body.role === 'owner') {
			throw new AppError('FORBIDDEN', 'Administradores não podem criar owners', 403)
		}

		return await UserService.createUser(body)
	}, {
		auth: { roles: ["admin", "owner"] },
		detail: {
			tags: ['Users'],
			summary: 'Create user',
			description: 'Create a new user (admin/owner only)',
		},
		body: UserModel.createUserBody,
		response: {
			200: UserModel.createUserResponse,
			400: UserModel.validationError,
		}
	})
	.put('/:id', async ({ params: { id }, body }) => {
		return await UserService.updateUserProfile(id, body)
	}, {
		auth: true,
		detail: {
			tags: ['Users'],
			summary: 'Update user profile',
			description: 'Update user profile by ID',
		},
		body: UserModel.updateUserProfileBody,
		response: {
			200: UserModel.updateUserProfileResponse,
			400: UserModel.validationError,
			404: UserModel.userNotFound,
		}
	})
	.delete('/:id', async ({ params: { id }, user }) => {
		return await UserService.deleteUser(id, user.role)
	}, {
		auth: { roles: ["admin", "owner"] },
		detail: {
			tags: ['Users'],
			summary: 'Delete user',
			description: 'Delete a user by ID (admin/owner only)',
		},
		response: {
			200: t.Object({
				message: t.String(),
			}),
			404: UserModel.userNotFound,
		}
	})
	.put('/:id/password', async ({ params: { id }, body, user }) => {
		// Verificar se o usuário logado é admin ou se está tentando alterar sua própria senha
		if (user.role !== 'admin' && user.userId !== id) {
			throw new AppError('FORBIDDEN', 'Você não tem permissão para alterar esta senha', 403)
		}

		return await UserService.changePassword(id, body)
	}, {
		auth: true,
		detail: {
			tags: ['Users'],
			summary: 'Change user password',
			description: 'Change user password (user must provide current password)',
		},
		body: UserModel.changePasswordBody,
		response: {
			200: UserModel.changePasswordResponse,
			400: UserModel.validationError,
			403: t.Literal('Você não tem permissão para alterar esta senha'),
			404: UserModel.userNotFound,
		}
	})
	.put('/:id/admin-password', async ({ params: { id }, body, user }) => {
		// Apenas owners e admins podem usar esta rota
		if (user.role !== 'owner' && user.role !== 'admin') {
			throw new AppError('FORBIDDEN', 'Apenas owners e administradores podem alterar senhas sem confirmação', 403)
		}

		return await UserService.changePasswordByAdmin(id, body, user.role)
	}, {
		auth: { roles: ["admin", "owner"] },
		detail: {
			tags: ['Users'],
			summary: 'Change user password (admin/owner)',
			description: 'Change user password without current password verification (admin/owner only)',
		},
		body: UserModel.changePasswordByAdminBody,
		response: {
			200: UserModel.changePasswordResponse,
			400: UserModel.validationError,
			403: t.Literal('Apenas owners e administradores podem alterar senhas sem confirmação'),
			404: UserModel.userNotFound,
		}
	})
