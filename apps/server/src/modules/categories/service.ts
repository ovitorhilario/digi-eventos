import { db, categories } from "@digi-eventos/db";
import { eq } from "drizzle-orm";
import type { CategoryModel } from './model'
import { AppError } from '../../lib/errors'

export abstract class CategoryService {
	static async create({ title, description }: CategoryModel.createCategoryBody): Promise<CategoryModel.createCategoryResponse> {
		// Check if category with same title exists
		const existingCategory = await db
			.select()
			.from(categories)
			.where(eq(categories.title, title))
			.limit(1);

		if (existingCategory.length > 0) {
			throw new AppError('CREATE_CATEGORY_INVALID', 'Título da categoria já existe', 400)
		}

		const [newCategory] = await db
			.insert(categories)
			.values({
				title,
				description,
			})
			.returning();

		if (!newCategory) {
			throw new AppError('INTERNAL_ERROR', 'Erro ao criar categoria', 500)
		}

		return {
			id: newCategory.id,
			title: newCategory.title,
			description: newCategory.description,
			createdAt: newCategory.createdAt.toISOString(),
			updatedAt: newCategory.updatedAt.toISOString(),
		};
	}

	static async getAll(): Promise<CategoryModel.getCategoriesResponse> {
		const allCategories = await db
			.select()
			.from(categories)
			.orderBy(categories.title);

		return allCategories.map(category => ({
			id: category.id,
			title: category.title,
			description: category.description,
			createdAt: category.createdAt.toISOString(),
			updatedAt: category.updatedAt.toISOString(),
		}));
	}

	static async getById(id: string): Promise<CategoryModel.getCategoryResponse> {
		const [category] = await db
			.select()
			.from(categories)
			.where(eq(categories.id, id))
			.limit(1);

		if (!category) {
			throw new AppError('NOT_FOUND', 'Categoria não encontrada', 404)
		}

		return {
			id: category.id,
			title: category.title,
			description: category.description,
			createdAt: category.createdAt.toISOString(),
			updatedAt: category.updatedAt.toISOString(),
		};
	}

	static async update(id: string, { title, description }: CategoryModel.updateCategoryBody): Promise<CategoryModel.updateCategoryResponse> {
		// Check if category exists
		const [existingCategory] = await db
			.select()
			.from(categories)
			.where(eq(categories.id, id))
			.limit(1);

		if (!existingCategory) {
			throw new AppError('NOT_FOUND', 'Categoria não encontrada', 404)
		}

		// Check if new title conflicts with another category
		if (title && title !== existingCategory.title) {
			const [conflictingCategory] = await db
				.select()
				.from(categories)
				.where(eq(categories.title, title))
				.limit(1);

			if (conflictingCategory) {
				throw new AppError('UPDATE_CATEGORY_INVALID', 'Categoria não encontrada ou título já existe', 400)
			}
		}

		const [updatedCategory] = await db
			.update(categories)
			.set({
				...(title && { title }),
				...(description !== undefined && { description }),
			})
			.where(eq(categories.id, id))
			.returning();

		if (!updatedCategory) {
			throw new AppError('INTERNAL_ERROR', 'Erro ao atualizar categoria', 500)
		}

		return {
			id: updatedCategory.id,
			title: updatedCategory.title,
			description: updatedCategory.description,
			createdAt: updatedCategory.createdAt.toISOString(),
			updatedAt: updatedCategory.updatedAt.toISOString(),
		};
	}

	static async delete(id: string): Promise<CategoryModel.deleteCategoryResponse> {
		// Check if category exists
		const [existingCategory] = await db
			.select()
			.from(categories)
			.where(eq(categories.id, id))
			.limit(1);

		if (!existingCategory) {
			throw new AppError('NOT_FOUND', 'Categoria não encontrada', 404)
		}

		await db
			.delete(categories)
			.where(eq(categories.id, id));

		return { message: 'Categoria deletada com sucesso' };
	}
}