import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
	email: text("email").unique().notNull(),
	name: text("name").notNull(),
	password: text("password").notNull(),
	avatarUrl: text("avatar_url"),
	role: text("role").notNull().default("user") // role no sistema: user, admin, owner
});