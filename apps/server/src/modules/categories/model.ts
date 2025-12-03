import { t } from 'elysia'

export namespace CategoryModel {
	// Create category
	export const createCategoryBody = t.Object({
		title: t.String({ minLength: 1 }),
		description: t.Union([t.String(), t.Null()]),
	})

	export type createCategoryBody = typeof createCategoryBody.static

	export const createCategoryResponse = t.Object({
		id: t.String(),
		title: t.String(),
		description: t.Union([t.String(), t.Null()]),
		createdAt: t.String(),
		updatedAt: t.String(),
	})

	export type createCategoryResponse = typeof createCategoryResponse.static

	export const createCategoryInvalid = t.Literal('Título da categoria já existe')
	export type createCategoryInvalid = typeof createCategoryInvalid.static

	// Get categories
	export const getCategoriesResponse = t.Array(t.Object({
		id: t.String(),
		title: t.String(),
		description: t.Union([t.String(), t.Null()]),
		createdAt: t.String(),
		updatedAt: t.String(),
	}))

	export type getCategoriesResponse = typeof getCategoriesResponse.static

	// Get category by id
	export const getCategoryResponse = t.Object({
		id: t.String(),
		title: t.String(),
		description: t.Union([t.String(), t.Null()]),
		createdAt: t.String(),
		updatedAt: t.String(),
	})

	export type getCategoryResponse = typeof getCategoryResponse.static

	export const getCategoryInvalid = t.Literal('Categoria não encontrada')
	export type getCategoryInvalid = typeof getCategoryInvalid.static

	// Update category
	export const updateCategoryBody = t.Object({
		title: t.Union([t.String({ minLength: 1 }), t.Null()]),
		description: t.Union([t.String(), t.Null()]),
	})

	export type updateCategoryBody = typeof updateCategoryBody.static

	export const updateCategoryResponse = t.Object({
		id: t.String(),
		title: t.String(),
		description: t.Union([t.String(), t.Null()]),
		createdAt: t.String(),
		updatedAt: t.String(),
	})

	export type updateCategoryResponse = typeof updateCategoryResponse.static

	export const updateCategoryInvalid = t.Literal('Categoria não encontrada ou título já existe')
	export type updateCategoryInvalid = typeof updateCategoryInvalid.static

	// Delete category
	export const deleteCategoryResponse = t.Object({
		message: t.String(),
	})

	export type deleteCategoryResponse = typeof deleteCategoryResponse.static

	export const deleteCategoryInvalid = t.Literal('Categoria não encontrada')
	export type deleteCategoryInvalid = typeof deleteCategoryInvalid.static
}