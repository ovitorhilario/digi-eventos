import { Elysia, t } from "elysia";
import { CategoryService } from "./service";
import { CategoryModel } from "./model";
import auth from "@/middleware/auth";

export const categoriesRoutes = new Elysia({ prefix: "/categories" })
	.use(auth)
	.post(
		"/",
		async ({ body }) => {
			return await CategoryService.create(body);
		},
		{	
			auth: { roles: ["admin", "owner"] },
			body: CategoryModel.createCategoryBody,
			response: {
				200: CategoryModel.createCategoryResponse,
				400: CategoryModel.createCategoryInvalid,
			},
		},
	)
	.get(
		"/",
		async () => {
			return await CategoryService.getAll();
		},
		{
			auth: true,
			response: {
				200: CategoryModel.getCategoriesResponse,
			},
		},
	)
	.get(
		"/:id",
		async ({ params: { id } }) => {
			return await CategoryService.getById(id);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: CategoryModel.getCategoryResponse,
				404: CategoryModel.getCategoryInvalid,
			},
		},
	)
	.put(
		"/:id",
		async ({ params: { id }, body }) => {
			return await CategoryService.update(id, body);
		},
		{
			auth: { roles: ["admin", "owner"] },
			params: t.Object({
				id: t.String(),
			}),
			body: CategoryModel.updateCategoryBody,
			response: {
				200: CategoryModel.updateCategoryResponse,
				400: CategoryModel.updateCategoryInvalid,
			},
		},
	)
	.delete(
		"/:id",
		async ({ params: { id } }) => {
			return await CategoryService.delete(id);
		},
		{
			auth: { roles: ["admin", "owner"] },
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: CategoryModel.deleteCategoryResponse,
				404: CategoryModel.deleteCategoryInvalid,
			},
		},
	);