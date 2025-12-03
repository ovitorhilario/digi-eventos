import { t } from 'elysia'

export namespace RegistrationModel {
	// Register for event
	export const registerBody = t.Object({
		eventId: t.String(),
	})

	export type registerBody = typeof registerBody.static

	export const registerResponse = t.Object({
		id: t.String(),
		userId: t.String(),
		eventId: t.String(),
		registeredAt: t.String(),
		cancelledParticipation: t.Boolean(),
		cancelledAt: t.Union([t.String(), t.Null()]),
		event: t.Object({
			id: t.String(),
			title: t.String(),
			description: t.Union([t.String(), t.Null()]),
			location: t.Union([t.String(), t.Null()]),
			startTime: t.String(),
			finishTime: t.Union([t.String(), t.Null()]),
			maxCapacity: t.Union([t.Number(), t.Null()]),
		}),
	})

	export type registerResponse = typeof registerResponse.static

	export const registrationInvalid = t.Literal('Já inscrito neste evento')
	export type registrationInvalid = typeof registrationInvalid.static

	export const eventFull = t.Literal('Evento lotado')
	export type eventFull = typeof eventFull.static

	export const eventNotFound = t.Literal('Evento não encontrado')
	export type eventNotFound = typeof eventNotFound.static

	// Get user registrations
	export const getRegistrationsResponse = t.Array(t.Object({
		id: t.String(),
		userId: t.String(),
		eventId: t.String(),
		registeredAt: t.String(),
		cancelledParticipation: t.Boolean(),
		cancelledAt: t.Union([t.String(), t.Null()]),
		event: t.Object({
			id: t.String(),
			title: t.String(),
			description: t.Union([t.String(), t.Null()]),
			location: t.Union([t.String(), t.Null()]),
			startTime: t.String(),
			finishTime: t.Union([t.String(), t.Null()]),
			maxCapacity: t.Union([t.Number(), t.Null()]),
		}),
	}))

	export type getRegistrationsResponse = typeof getRegistrationsResponse.static

	// Cancel registration
	export const cancelResponse = t.Object({
		message: t.Literal('Inscrição cancelada com sucesso'),
	})

	export type cancelResponse = typeof cancelResponse.static

	export const registrationNotFound = t.Literal('Inscrição não encontrada')
	export type registrationNotFound = typeof registrationNotFound.static
}