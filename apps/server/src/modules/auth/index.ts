import auth, { verifyRefreshToken } from "@/middleware/auth";
import { Elysia, t } from "elysia";
import { AuthService } from "./service";
import { AuthModel } from "./model";

export const authRoutes = new Elysia({ prefix: "/auth" })
	.use(auth)
	.post(
		"/login",
		async ({ body, cookie: { refreshToken } }) => {
			const result = await AuthService.login(body);
			const refreshTokenData = await AuthService.refreshTokens(result.user.id);

			refreshToken.value = refreshTokenData.refreshToken;
			refreshToken.httpOnly = true;
			refreshToken.secure = true;
			refreshToken.sameSite = 'strict';
			refreshToken.maxAge = 60 * 60 * 24 * 7; // 7 days

			return result;
		},
		{
			body: AuthModel.loginBody,
			response: {
				200: AuthModel.loginResponse,
				401: AuthModel.loginInvalid,
			},
			cookie: t.Cookie({
				refreshToken: t.Optional(t.String()),
			})
		},
	)
	.get(
		"/me",
		async ({ cookie: { refreshToken } }) => {

			const refreshTokenValue = refreshToken!.value as string;
			if (!refreshTokenValue) {
				throw new Error('Unauthorized');
			}

			try {
				const payload = await verifyRefreshToken(refreshTokenValue);
				const result = await AuthService.refreshTokens(payload.userId);

				refreshToken.value = result.refreshToken;
				refreshToken.httpOnly = true;
				refreshToken.secure = true;
				refreshToken.sameSite = 'strict';
				refreshToken.maxAge = 60 * 60 * 24 * 7;

				return {
					user: result.user,
					accessToken: result.accessToken,
				};
			} catch (err) {
				throw new Error('Unauthorized');
			}
		},
		{
			response: {
				200: AuthModel.meResponse,
				404: AuthModel.meInvalid,
			},
			cookie: t.Cookie({
				refreshToken: t.Optional(t.String())
			})
		},
	)
	.post(
		"/logout",
		async ({ cookie: { refreshToken } }) => {

			refreshToken.value = "";
			refreshToken.httpOnly = true;
			refreshToken.secure = true;
			refreshToken.sameSite = 'strict';
			refreshToken.maxAge = 0;
			refreshToken.path = '/';

			refreshToken.remove();
			return { message: "Logout realizado com sucesso" };
		},
		{
			response: {
				200: t.Object({
					message: t.String(),
				}),
			},
			cookie: t.Cookie({
				refreshToken: t.Optional(t.String()),
			})
		},
	);