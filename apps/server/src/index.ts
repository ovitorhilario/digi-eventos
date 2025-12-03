import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./modules/auth";
import { eventRoutes } from "./modules/events";
import { registrationRoutes } from "./modules/registrations";
import { usersModule } from "./modules/users";
import { categoriesRoutes } from "./modules/categories";
import { openapi } from "@elysiajs/openapi"
import { AppError } from "./lib/errors";
import auth from "./middleware/auth";

export const app = new Elysia()
	.use(
		openapi({
			documentation: {
				info: {
					title: 'Digi Eventos API',
					version: '1.0.0'
				}
			}
		})
	)
	.use(
		cors({
			origin: process.env.CORS_ORIGIN || "",
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		}),
	)
	.error({
		AppError
	})
	.onError(({ error, code, set }) => {
		switch (code) {
			case 'AppError':
				set.status = (error as AppError).status;
				return {
					error: (error as AppError).error,
					message: (error as AppError).message
				};
			case 'VALIDATION':
				set.status = 400;
				return {
					error: 'VALIDATION',
					message: process.env.NODE_ENV === 'production'
						? 'Dados inválidos'
						: error.message || 'Dados inválidos'
				};
			case 'NOT_FOUND':
				set.status = 404;
				return {
					error: 'NOT_FOUND',
					message: 'Recurso não encontrado'
				};
			case 'INTERNAL_SERVER_ERROR':
				set.status = 500;
				return {
					error: 'INTERNAL_SERVER_ERROR',
					message: 'Erro interno do servidor'
				};
			default:
				console.error('Unhandled error:', code, error);
				set.status = 500;
				return {
					error: 'UNKNOWN_ERROR',
					message: 'Erro desconhecido'
				};
		}
	})
	.use(auth)
	.use(authRoutes)
	.use(eventRoutes)
	.use(registrationRoutes)
	.use(usersModule)
	.use(categoriesRoutes)
	.listen(3000, () => {
		console.log("Server is running on http://localhost:3000");
	});

export type App = typeof app;