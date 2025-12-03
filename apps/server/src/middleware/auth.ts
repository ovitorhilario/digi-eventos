import { Elysia } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from 'jose';

type Claims = { userId: string; email: string; role: string };
type JWTClaims = Claims & JWTPayload;

type Role = "admin" | "user" | "owner";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export const signAccessToken = async (value: Claims) => {
	return new SignJWT({
		sub: value.userId,
		userId: value.userId,
		email: value.email,
		role: value.role,
		type: 'access',
	})
	.setProtectedHeader({ alg: 'HS256' })
	.setExpirationTime('15m') // 15 minutes
	.sign(secret);
};

export const signRefreshToken = async (value: Claims) => {
	return new SignJWT({
		sub: value.userId,
		userId: value.userId,
		email: value.email,
		role: value.role,
		type: 'refresh',
	})
	.setProtectedHeader({ alg: 'HS256' })
	.setExpirationTime('7d') // 7 days
	.sign(secret);
};

export const signUser = signAccessToken; // Keep backward compatibility

export const verifyAccessToken = async (token: string): Promise<JWTClaims> => {
	try {
		const { payload } = await jwtVerify(token, secret);
		if ((payload as any).type !== 'access') {
			throw new Error('Invalid token type');
		}
		return payload as JWTClaims;
	} catch {
		throw new Error("Unauthorized");
	}
};

export const verifyRefreshToken = async (token: string): Promise<JWTClaims> => {
	try {
		const { payload } = await jwtVerify(token, secret);
		if ((payload as any).type !== 'refresh') {
			throw new Error('Invalid token type');
		}
		return payload as JWTClaims;
	} catch {
		throw new Error("Unauthorized");
	}
};

const auth = new Elysia({ name: "auth-plugin" })
	.use(bearer())
	.derive(({ bearer }) => ({
		/**
		 * Verify the bearer token and return the decoded payload.
		 * Throws if the token is missing or invalid.
		 */
		getCurrentUser: async (): Promise<JWTClaims> => {
			if (!bearer) {
				throw new Error("Unauthorized");
			}
			return await verifyAccessToken(bearer);
		},

		/**
		 * Sign a token containing the minimal user claims.
		 * You can customize the expiration using `options` if needed.
		 */
		signUser,
		signAccessToken,
		signRefreshToken,
		verifyAccessToken,
		verifyRefreshToken,
	}))
	.macro({
		isSignedIn: {
			async beforeHandle({ getCurrentUser, status }) {
				try {
					if (!getCurrentUser) {
						throw new Error("Unauthorized");
					}
					return await getCurrentUser();
				} catch (err) {
					return status(401);
				}
			},
		},
	})
	.macro({
		auth: (params: { roles: Role[] } | boolean) => ({
			resolve: async ({ bearer, status }) => {
				// If auth is disabled, return nothing
				if (params === false) {
					return;
				}

				// Require bearer token
				if (!bearer) {
					return status(401);
				}

				try {
					const payload = await verifyAccessToken(bearer);

					// If params is true, allow any authenticated user
					if (params === true) {
						return { user: payload };
					}

					// If params has roles, check if user's role is allowed
					if (typeof params === 'object' && params.roles?.length) {
						if (!params.roles.includes(payload.role as Role)) {
							return status(403);
						}
					}

					return { user: payload };
				} catch {
					return status(401);
				}
			}
		})
	});

export default auth;