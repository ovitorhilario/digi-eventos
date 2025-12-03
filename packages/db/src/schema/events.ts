import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const events = pgTable("events", {
	id: uuid("id").primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
	title: text("title").notNull(),
	description: text("description"),
	location: text("location"),
	startTime: timestamp("start_time").notNull(),
	finishTime: timestamp("finish_time"),
	maxCapacity: integer("max_capacity"),
	imageUrl: text("image_url"),
	createdBy: uuid("created_by")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
	cancelledAt: timestamp("cancelled_at"),
});

export const categories = pgTable("categories", {
	id: uuid("id").primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
	title: text("title").notNull().unique(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const eventCategory = pgTable(
	"event_category",
	{
		eventId: uuid("event_id")
			.notNull()
			.references(() => events.id, { onDelete: "cascade" }),
		categoryId: uuid("category_id")
			.notNull()
			.references(() => categories.id, { onDelete: "cascade" }),
	},
	(table) => ([
		primaryKey({ columns: [table.eventId, table.categoryId] }),
	])
);

export const eventParticipant = pgTable("event_participant", {
	id: uuid("id").primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	eventId: uuid("event_id")
		.notNull()
		.references(() => events.id, { onDelete: "cascade" }),
	registeredAt: timestamp("registered_at").defaultNow().notNull(),
	cancelledParticipation: boolean("cancelled_participation").default(false).notNull(),
	cancelledAt: timestamp("cancelled_at"),
});

export const eventsRelations = relations(events, ({ many }) => ({
	eventCategories: many(eventCategory),
	participants: many(eventParticipant),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
	eventCategories: many(eventCategory),
}));

export const eventCategoryRelations = relations(eventCategory, ({ one }) => ({
	event: one(events, {
		fields: [eventCategory.eventId],
		references: [events.id],
	}),
	category: one(categories, {
		fields: [eventCategory.categoryId],
		references: [categories.id],
	}),
}));

export const eventParticipantRelations = relations(eventParticipant, ({ one }) => ({
	user: one(users, {
		fields: [eventParticipant.userId],
		references: [users.id],
	}),
	event: one(events, {
		fields: [eventParticipant.eventId],
		references: [events.id],
	}),
}));

export const userRelations = relations(users, ({ many }) => ({
	createdEvents: many(events),
	participations: many(eventParticipant),
}));