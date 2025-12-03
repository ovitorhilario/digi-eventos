import { t } from 'elysia'

export namespace EventModel {

	const participantModel = t.Object({
		id: t.String(),
		userId: t.String(),
		registeredAt: t.String(),
		user: t.Object({
			id: t.String(),
			name: t.String(),
			email: t.String(),
			avatarUrl: t.Union([t.String(), t.Null()]), // Image URL
		}),
	})

	export type participantModel = typeof participantModel.static

	// Get events
	export const getEventsResponse = t.Array(t.Object({
		id: t.String(),
		title: t.String(),
		description: t.Union([t.String(), t.Null()]),
		location: t.Union([t.String(), t.Null()]),
		startTime: t.String(),
		finishTime: t.Union([t.String(), t.Null()]),
		maxCapacity: t.Union([t.Number(), t.Null()]),
		imageUrl: t.Union([t.String(), t.Null()]), // Image URL
		createdBy: t.String(),
		createdAt: t.String(),
		updatedAt: t.String(),
		cancelledAt: t.Union([t.String(), t.Null()]),
		categories: t.Array(t.Object({
			id: t.String(),
			title: t.String(),
			description: t.Union([t.String(), t.Null()]),
		})),
		participantCount: t.Number(),
		participants: t.Array(participantModel),
	}))

	export type getEventsResponse = typeof getEventsResponse.static

	// Get event by id
	export const getEventResponse = t.Object({
		id: t.String(),
		title: t.String(),
		description: t.Union([t.String(), t.Null()]),
		location: t.Union([t.String(), t.Null()]),
		startTime: t.String(),
		finishTime: t.Union([t.String(), t.Null()]),
		maxCapacity: t.Union([t.Number(), t.Null()]),
		imageUrl: t.Union([t.String(), t.Null()]), // Image URL
		createdBy: t.String(),
		createdAt: t.String(),
		updatedAt: t.String(),
		cancelledAt: t.Union([t.String(), t.Null()]),
		categories: t.Array(t.Object({
			id: t.String(),
			title: t.String(),
			description: t.Union([t.String(), t.Null()]),
		})),
		participants: t.Array(participantModel),
		participantCount: t.Number(),
	})

	export type getEventResponse = typeof getEventResponse.static

	export const eventNotFound = t.Literal('Evento não encontrado')
	export type eventNotFound = typeof eventNotFound.static

	// Create event (for admins)
	export const createEventBody = t.Object({
		title: t.String(),
		description: t.Union([t.String(), t.Null()]),
		location: t.Union([t.String(), t.Null()]),
		startTime: t.String(),
		finishTime: t.Union([t.String(), t.Null()]),
		maxCapacity: t.Union([t.Number(), t.Null()]),
		image: t.Union([t.String(), t.Null()]), // Base64 encoded image (input)
		categoryIds: t.Array(t.String()),
	})

	export type createEventBody = typeof createEventBody.static

	export const createEventResponse = t.Object({
		id: t.String(),
		title: t.String(),
		description: t.Union([t.String(), t.Null()]),
		location: t.Union([t.String(), t.Null()]),
		startTime: t.String(),
		finishTime: t.Union([t.String(), t.Null()]),
		maxCapacity: t.Union([t.Number(), t.Null()]),
		imageUrl: t.Union([t.String(), t.Null()]), // Image URL (output)
		createdBy: t.String(),
		createdAt: t.String(),
		updatedAt: t.String(),
		cancelledAt: t.Null(),
		categories: t.Array(t.Object({
			id: t.String(),
			title: t.String(),
			description: t.Union([t.String(), t.Null()]),
		})),
	})

	export type createEventResponse = typeof createEventResponse.static

	// Update event (for admins)
	export const updateEventBody = t.Object({
		title: t.Optional(t.String()),
		description: t.Optional(t.Union([t.String(), t.Null()])),
		location: t.Optional(t.Union([t.String(), t.Null()])),
		startTime: t.Optional(t.String()),
		finishTime: t.Optional(t.Union([t.String(), t.Null()])),
		maxCapacity: t.Optional(t.Union([t.Number(), t.Null()])),
		image: t.Optional(t.Union([t.String(), t.Null()])), // Base64 encoded image (input)
		categoryIds: t.Optional(t.Array(t.String())),
	})

	export type updateEventBody = typeof updateEventBody.static

	export const updateEventResponse = t.Object({
		id: t.String(),
		title: t.String(),
		description: t.Union([t.String(), t.Null()]),
		location: t.Union([t.String(), t.Null()]),
		startTime: t.String(),
		finishTime: t.Union([t.String(), t.Null()]),
		maxCapacity: t.Union([t.Number(), t.Null()]),
		imageUrl: t.Union([t.String(), t.Null()]), // Image URL (output)
		createdBy: t.String(),
		createdAt: t.String(),
		updatedAt: t.String(),
		cancelledAt: t.Union([t.String(), t.Null()]),
		categories: t.Array(t.Object({
			id: t.String(),
			title: t.String(),
			description: t.Union([t.String(), t.Null()]),
		})),
	})

	export type updateEventResponse = typeof updateEventResponse.static

	// Delete event
	export const deleteEventResponse = t.Object({
		message: t.String(),
	})

	export type deleteEventResponse = typeof deleteEventResponse.static

	export const deleteEventInvalid = t.Literal('Evento não encontrado')
	export type deleteEventInvalid = typeof deleteEventInvalid.static
}