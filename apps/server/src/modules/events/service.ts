import { db, events, eventCategory, eventParticipant } from "@digi-eventos/db";
import { eq, and } from "drizzle-orm";
import type { EventModel } from './model'
import { AppError } from '../../lib/errors'
import { uploadToS3 } from "@/lib/s3-upload";

export abstract class EventService {
	static async getEvents(): Promise<EventModel.getEventsResponse> {
		// Fetch all active events with their data
		const events = await db.query.events.findMany({
			where: (events, { isNull }) => isNull(events.cancelledAt),
			orderBy: (events, { asc }) => [asc(events.startTime)],
			with: {
				eventCategories: {
					columns: {},
					with: {
						category: {
							columns: {
								id: true,
								title: true,
								description: true,
							}
						}
					}
				},
				participants: {
					columns: {
						id: true,
						userId: true,
						registeredAt: true,
					},
					where: (participants, { eq }) => eq(participants.cancelledParticipation, false),
					with: {
						user: {
							columns: {
								id: true,
								name: true,
								email: true,
								avatarUrl: true,
							}
						}
					}
				}
			}
		})

		return events.map(event => {
			const baseEvent: Omit<EventModel.getEventResponse, "participants"> = {
				id: event.id,
				title: event.title,
				description: event.description,
				location: event.location,
				startTime: event.startTime.toISOString(),
				finishTime: event.finishTime?.toISOString() ?? null,
				maxCapacity: event.maxCapacity,
				imageUrl: event.imageUrl,
				createdBy: event.createdBy,
				createdAt: event.createdAt.toISOString(),
				updatedAt: event.updatedAt.toISOString(),
				cancelledAt: event.cancelledAt?.toISOString() ?? null,
				categories: event.eventCategories.map(ec => ec.category),
				participantCount: event.participants.length,
			}

			const participants: EventModel.participantModel[] = event.participants.map((p) => ({
				id: p.id,
				userId: p.userId,
				registeredAt: p.registeredAt.toISOString(),
				user: {
					id: p.user.id,
					name: p.user.name,
					email: p.user.email,
					avatarUrl: p.user.avatarUrl,
				}
			}))

			return {
				...baseEvent,
				participants,
			}
		})
	}

	static async getUserEvents(userId: string): Promise<EventModel.getEventsResponse> {
		// Fetch events where the user is registered (not cancelled participation)
		// First get the event IDs the user is registered for
		const userParticipations = await db
			.select({
				eventId: eventParticipant.eventId,
			})
			.from(eventParticipant)
			.where(
				and(
					eq(eventParticipant.userId, userId),
					eq(eventParticipant.cancelledParticipation, false)
				)
			)

		if (userParticipations.length === 0) {
			return []
		}

		const eventIds = userParticipations.map(p => p.eventId)

		// Now fetch the events with their data
		const eventsData = await db.query.events.findMany({
			where: (events, { and, isNull, inArray }) => and(
				inArray(events.id, eventIds),
				isNull(events.cancelledAt)
			),
			orderBy: (events, { asc }) => [asc(events.startTime)],
			with: {
				eventCategories: {
					columns: {},
					with: {
						category: {
							columns: {
								id: true,
								title: true,
								description: true,
							}
						}
					}
				},
				participants: {
					columns: {
						id: true,
					},
					where: (participants, { eq }) => eq(participants.cancelledParticipation, false)
				}
			}
		})

		return eventsData.map(event => {
			const baseEvent: Omit<EventModel.getEventResponse, "participants"> = {
				id: event.id,
				title: event.title,
				description: event.description,
				location: event.location,
				startTime: event.startTime.toISOString(),
				finishTime: event.finishTime?.toISOString() ?? null,
				maxCapacity: event.maxCapacity,
				imageUrl: event.imageUrl,
				createdBy: event.createdBy,
				createdAt: event.createdAt.toISOString(),
				updatedAt: event.updatedAt.toISOString(),
				cancelledAt: event.cancelledAt?.toISOString() ?? null,
				categories: event.eventCategories.map(ec => ec.category),
				participantCount: event.participants.length,
			}

			return {
				...baseEvent,
				participants: [], // Always return empty array for user events (they already know they're participants)
			}
		})
	}

	static async getUserEventIds(userId: string): Promise<string[]> {
		// Fetch event IDs where the user is registered (not cancelled participation)
		const userParticipations = await db
			.select({
				eventId: eventParticipant.eventId,
			})
			.from(eventParticipant)
			.where(
				and(
					eq(eventParticipant.userId, userId),
					eq(eventParticipant.cancelledParticipation, false)
				)
			)

		return userParticipations.map(p => p.eventId)
	}

	static async getEventById(id: string): Promise<EventModel.getEventResponse> {
		// Fetch the event with categories and participants in a single query using Relational Query API
		const event = await db.query.events.findFirst({
			where: (events, { eq, and, isNull }) => and(
				eq(events.id, id),
				isNull(events.cancelledAt)
			),
			with: {
				eventCategories: {
					columns: {},
					with: {
						category: {
							columns: {
								id: true,
								title: true,
								description: true,
							}
						}
					}
				},
				participants: {
					columns: {
						id: true,
						userId: true,
						registeredAt: true,
					},
					where: (participants, { eq }) => eq(participants.cancelledParticipation, false),
					with: {
						user: {
							columns: {
								id: true,
								name: true,
								email: true,
								avatarUrl: true,
							}
						}
					}
				}
			}
		})

		if (!event) {
			throw new AppError('NOT_FOUND', 'Evento não encontrado', 404)
		}

		// Extract categories from the nested structure
		const eventCategories = event.eventCategories.map(ec => ec.category)

		// Format participants with user information
		const participants: EventModel.participantModel[] = event.participants.map(p => ({
			id: p.id,
			userId: p.userId,
			registeredAt: p.registeredAt.toISOString(),
			user: {
				id: p.user.id,
				name: p.user.name,
				email: p.user.email,
				avatarUrl: p.user.avatarUrl,
			}
		}))

		return {
			id: event.id,
			title: event.title,
			description: event.description,
			location: event.location,
			startTime: event.startTime.toISOString(),
			finishTime: event.finishTime?.toISOString() ?? null,
			maxCapacity: event.maxCapacity,
			imageUrl: event.imageUrl,
			createdBy: event.createdBy,
			createdAt: event.createdAt.toISOString(),
			updatedAt: event.updatedAt.toISOString(),
			cancelledAt: event.cancelledAt?.toISOString() ?? null,
			categories: eventCategories,
			participants: participants,
			participantCount: event.participants.length,
		}
	}

	static async createEvent(data: EventModel.createEventBody, createdBy: string): Promise<EventModel.createEventResponse> {
		// Handle image upload if provided
		let imageUrl: string | null = null
		if (data.image) {
			const result = await uploadToS3(data.image, {
				folder: "events",
				originalName: "event.jpg",
			})
			imageUrl = result.url
		}

		// Insert event and get the full row with automatic typing
		const newEventRows = await db
			.insert(events)
			.values({
				title: data.title,
				description: data.description,
				location: data.location,
				startTime: new Date(data.startTime),
				finishTime: data.finishTime ? new Date(data.finishTime) : null,
				maxCapacity: data.maxCapacity,
				imageUrl,
				createdBy,
			})
			.returning()

		const newEvent = newEventRows[0]

		if (!newEvent) {
			throw new AppError('INTERNAL_ERROR', 'Erro ao criar evento', 500)
		}

		// Insert categories if provided
		if (data.categoryIds.length > 0) {
			await db
				.insert(eventCategory)
				.values(
					data.categoryIds.map(categoryId => ({
						eventId: newEvent.id,
						categoryId,
					}))
				)
		}

		// Fetch the event with categories using Relational Query API
		const eventWithCategories = await db.query.events.findFirst({
			where: (events, { eq }) => eq(events.id, newEvent.id),
			with: {
				eventCategories: {
					columns: {},
					with: {
						category: {
							columns: {
								id: true,
								title: true,
								description: true,
							}
						}
					}
				}
			}
		})

		const eventCategories = eventWithCategories?.eventCategories.map(ec => ec.category) ?? []

		return {
			id: newEvent.id,
			title: newEvent.title,
			description: newEvent.description,
			location: newEvent.location,
			startTime: newEvent.startTime.toISOString(),
			finishTime: newEvent.finishTime?.toISOString() ?? null,
			maxCapacity: newEvent.maxCapacity,
			imageUrl: newEvent.imageUrl,
			createdBy: newEvent.createdBy,
			createdAt: newEvent.createdAt.toISOString(),
			updatedAt: newEvent.updatedAt.toISOString(),
			cancelledAt: null,
			categories: eventCategories,
		}
	}

	static async updateEvent(id: string, data: EventModel.updateEventBody): Promise<EventModel.updateEventResponse> {
		// Check if event exists
		const existingEvent = await db.query.events.findFirst({
			where: (events, { eq, and, isNull }) => and(
				eq(events.id, id),
				isNull(events.cancelledAt)
			),
		})

		if (!existingEvent) {
			throw new AppError('NOT_FOUND', 'Evento não encontrado', 404)
		}

		// Prepare update data
		const updateData: any = {}
		if (data.title !== undefined) updateData.title = data.title
		if (data.description !== undefined) updateData.description = data.description
		if (data.location !== undefined) updateData.location = data.location
		if (data.startTime !== undefined) updateData.startTime = new Date(data.startTime)
		if (data.finishTime !== undefined) updateData.finishTime = data.finishTime ? new Date(data.finishTime) : null
		if (data.maxCapacity !== undefined) updateData.maxCapacity = data.maxCapacity
		if (data.image !== undefined) {
			if (data.image === null) {
				updateData.imageUrl = null
			} else {
				const result = await uploadToS3(data.image, {
					folder: "events",
					originalName: "event.jpg",
				})
				updateData.imageUrl = result.url
			}
		}

		// Update the event
		const updatedEventRows = await db
			.update(events)
			.set(updateData)
			.where(eq(events.id, id))
			.returning()

		const updatedEvent = updatedEventRows[0]

		if (!updatedEvent) {
			throw new AppError('INTERNAL_ERROR', 'Erro ao atualizar evento', 500)
		}

		// Update categories if provided
		if (data.categoryIds !== undefined) {
			// Delete existing categories
			await db
				.delete(eventCategory)
				.where(eq(eventCategory.eventId, id))

			// Insert new categories
			if (data.categoryIds.length > 0) {
				await db
					.insert(eventCategory)
					.values(
						data.categoryIds.map(categoryId => ({
							eventId: id,
							categoryId,
						}))
					)
			}
		}

		// Fetch the updated event with categories
		const eventWithCategories = await db.query.events.findFirst({
			where: (events, { eq }) => eq(events.id, id),
			with: {
				eventCategories: {
					columns: {},
					with: {
						category: {
							columns: {
								id: true,
								title: true,
								description: true,
							}
						}
					}
				}
			}
		})

		const eventCategories = eventWithCategories?.eventCategories.map(ec => ec.category) ?? []

		return {
			id: updatedEvent.id,
			title: updatedEvent.title,
			description: updatedEvent.description,
			location: updatedEvent.location,
			startTime: updatedEvent.startTime.toISOString(),
			finishTime: updatedEvent.finishTime?.toISOString() ?? null,
			maxCapacity: updatedEvent.maxCapacity,
			imageUrl: updatedEvent.imageUrl,
			createdBy: updatedEvent.createdBy,
			createdAt: updatedEvent.createdAt.toISOString(),
			updatedAt: updatedEvent.updatedAt.toISOString(),
			cancelledAt: updatedEvent.cancelledAt?.toISOString() ?? null,
			categories: eventCategories,
		}
	}

	static async deleteEvent(id: string): Promise<EventModel.deleteEventResponse> {
		// Check if event exists
		const [existingEvent] = await db
			.select()
			.from(events)
			.where(eq(events.id, id))
			.limit(1);

		if (!existingEvent) {
			throw new AppError('NOT_FOUND', 'Evento não encontrado', 404)
		}

		// Delete the event (this will cascade delete related records due to foreign key constraints)
		await db
			.delete(events)
			.where(eq(events.id, id));

		return { message: 'Evento deletado com sucesso' };
	}
}