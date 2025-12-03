import { db } from "@digi-eventos/db";
import { users } from "@digi-eventos/db";
import { eq } from "drizzle-orm";
import type { UserModel } from './model'
import { AppError } from '../../lib/errors'
import { uploadToS3 } from "@/lib/s3-upload";

export abstract class UserService {
	static async getUserProfile(userId: string): Promise<UserModel.getUserProfileResponse> {
		// Fetch user profile using Relational Query API
		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, userId),
			columns: {
				id: true,
				name: true,
				email: true,
				role: true,
				avatarUrl: true,
			}
		})

		if (!user) {
			throw new AppError('NOT_FOUND', 'Usuário não encontrado', 404)
		}

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			avatarUrl: user.avatarUrl
		}
	}

	static async updateUserProfile(userId: string, data: UserModel.updateUserProfileBody): Promise<UserModel.updateUserProfileResponse> {
		// Check if user exists
		const existingUser = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, userId),
		})

		if (!existingUser) {
			throw new AppError('NOT_FOUND', 'Usuário não encontrado', 404)
		}

		// Prepare update data
		const updateData: any = {}

		if (data.name !== undefined) {
			updateData.name = data.name
		}

		if (data.email !== undefined) {
			// Check if email is already taken by another user
			if (data.email !== existingUser.email) {
				const emailExists = await db
					.select()
					.from(users)
					.where(eq(users.email, data.email))
					.limit(1)
				if (emailExists.length > 0) {
					throw new AppError('VALIDATION', 'Email já está em uso', 400)
				}
			}
			updateData.email = data.email
		}

		if (data.avatar !== undefined) {
			// Convert base64 to file URL if avatar is provided
			if (data.avatar === null) {
				updateData.avatarUrl = null
			} else {
				const result = await uploadToS3(data.avatar, {
					folder: "avatars",
					originalName: "avatar.jpg",
				})
				updateData.avatarUrl = result.url
			}
		}

		// Update user
		await db
			.update(users)
			.set(updateData)
			.where(eq(users.id, userId))

		// Fetch updated user
		const updatedUser = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, userId),
			columns: {
				id: true,
				name: true,
				email: true,
				role: true,
				avatarUrl: true,
			}
		})

		if (!updatedUser) {
			throw new AppError('INTERNAL_SERVER_ERROR', 'Erro ao atualizar usuário', 500)
		}

		return {
			id: updatedUser.id,
			name: updatedUser.name,
			email: updatedUser.email,
			role: updatedUser.role,
			avatarUrl: updatedUser.avatarUrl
		}
	}

	static async createUser(data: UserModel.createUserBody): Promise<UserModel.createUserResponse> {
		// Check if email is already taken
		const existingUser = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.email, data.email),
		})
		if (existingUser) {
			throw new AppError('VALIDATION', 'Email já está em uso', 400)
		}

		// Hash the password
		const hashedPassword = await Bun.password.hash(data.password, {
			algorithm: "bcrypt",
			cost: 10,
		});

		// Prepare insert data
		const insertData: any = {
			email: data.email,
			name: data.name,
			password: hashedPassword,
			role: data.role || 'user',
		}

		if (data.avatar !== undefined) {
			if (data.avatar === null) {
				insertData.avatarUrl = null
			} else {
				const result = await uploadToS3(data.avatar, {
					folder: "avatars",
					originalName: "avatar.jpg",
				})
				insertData.avatarUrl = result.url
			}
		}

		// Create user
		const [newUser] = await db
			.insert(users)
			.values(insertData)
			.returning({
				id: users.id,
				name: users.name,
				email: users.email,
				role: users.role,
				avatarUrl: users.avatarUrl,
			})

		if (!newUser) {
			throw new AppError('INTERNAL_SERVER_ERROR', 'Erro ao criar usuário', 500)
		}

		return {
			id: newUser.id,
			name: newUser.name,
			email: newUser.email,
			role: newUser.role,
			avatarUrl: newUser.avatarUrl
		}
	}

	static async deleteUser(userId: string, callerRole: string): Promise<{ message: string }> {
		// Check if user exists
		const existingUser = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, userId),
		})

		if (!existingUser) {
			throw new AppError('NOT_FOUND', 'Usuário não encontrado', 404)
		}

		// Owners podem deletar qualquer usuário (exceto outros owners)
		// Admins só podem deletar users
		if (callerRole === 'admin' && existingUser.role !== 'user') {
			throw new AppError('FORBIDDEN', 'Administradores só podem excluir usuários comuns', 403)
		}
		if (callerRole === 'owner' && existingUser.role === 'owner') {
			throw new AppError('FORBIDDEN', 'Não é permitido excluir outros owners', 403)
		}

		// Delete user
		await db
			.delete(users)
			.where(eq(users.id, userId))

		return {
			message: 'Usuário deletado com sucesso'
		}
	}

	static async getAllUsers(): Promise<UserModel.getUsersResponse> {
		// Fetch all users
		const users = await db.query.users.findMany({
			columns: {
				id: true,
				name: true,
				email: true,
				role: true,
				avatarUrl: true,
			}
		})

		return users
	}

	static async changePassword(userId: string, data: UserModel.changePasswordBody): Promise<UserModel.changePasswordResponse> {
		// Check if user exists and get current password
		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, userId),
			columns: {
				id: true,
				password: true,
			}
		})

		if (!user) {
			throw new AppError('NOT_FOUND', 'Usuário não encontrado', 404)
		}

		// Verify current password
		const isValidCurrentPassword = await Bun.password.verify(
			data.currentPassword,
			user.password,
		)

		if (!isValidCurrentPassword) {
			throw new AppError('VALIDATION_ERROR', 'Senha atual incorreta', 400)
		}

		// Check if new password matches confirmation
		if (data.newPassword !== data.confirmPassword) {
			throw new AppError('VALIDATION_ERROR', 'Nova senha e confirmação não coincidem', 400)
		}

		// Check if new password is different from current
		const isSamePassword = await Bun.password.verify(
			data.newPassword,
			user.password,
		)

		if (isSamePassword) {
			throw new AppError('VALIDATION_ERROR', 'Nova senha deve ser diferente da senha atual', 400)
		}

		// Hash the new password
		const hashedNewPassword = await Bun.password.hash(data.newPassword, {
			algorithm: "bcrypt",
			cost: 10,
		})

		// Update password
		await db
			.update(users)
			.set({
				password: hashedNewPassword,
			})
			.where(eq(users.id, userId))

		return {
			message: 'Senha alterada com sucesso'
		}
	}

	static async changePasswordByAdmin(userId: string, data: UserModel.changePasswordByAdminBody, callerRole: string): Promise<UserModel.changePasswordResponse> {
		// Check if user exists
		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, userId),
			columns: {
				id: true,
				role: true,
			}
		})

		if (!user) {
			throw new AppError('NOT_FOUND', 'Usuário não encontrado', 404)
		}

		// Owners podem alterar senhas de qualquer usuário (exceto outros owners)
		// Admins só podem alterar senhas de users
		if (callerRole === 'admin' && user.role !== 'user') {
			throw new AppError('FORBIDDEN', 'Administradores só podem alterar senhas de usuários comuns', 403)
		}
		if (callerRole === 'owner' && user.role === 'owner') {
			throw new AppError('FORBIDDEN', 'Não é permitido alterar a senha de outros owners', 403)
		}

		// Check if new password matches confirmation
		if (data.newPassword !== data.confirmPassword) {
			throw new AppError('VALIDATION_ERROR', 'Nova senha e confirmação não coincidem', 400)
		}

		// Hash the new password
		const hashedNewPassword = await Bun.password.hash(data.newPassword, {
			algorithm: "bcrypt",
			cost: 10,
		})

		// Update password
		await db
			.update(users)
			.set({
				password: hashedNewPassword,
			})
			.where(eq(users.id, userId))

		return {
			message: 'Senha alterada com sucesso'
		}
	}
}
