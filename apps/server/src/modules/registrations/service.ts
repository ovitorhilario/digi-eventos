import { db, eventParticipant } from "@digi-eventos/db";
import { eq, and, count } from "drizzle-orm";
import type { RegistrationModel } from './model'
import { AppError } from '../../lib/errors'

export abstract class RegistrationService {
	static async registerForEvent(eventId: string, userId: string): Promise<RegistrationModel.registerResponse> {
		// Check if event exists and is not cancelled using Relational Query API
		const event = await db.query.events.findFirst({
			where: (events, { eq, and, isNull }) => and(
				eq(events.id, eventId),
				isNull(events.cancelledAt)
			)
		})

		if (!event) {
			throw new AppError('NOT_FOUND', 'Evento não encontrado', 404)
		}

		// Check if user is already registered
		const existing = await db.query.eventParticipant.findFirst({
			where: (eventParticipant, { eq, and }) => and(
				eq(eventParticipant.userId, userId),
				eq(eventParticipant.eventId, eventId)
			)
		})

		if (existing && !existing.cancelledParticipation) {
			throw new AppError('REGISTRATION_INVALID', 'Já inscrito neste evento', 400)
		}

		// Re-activate the cancelled registration
		if (existing && existing.cancelledParticipation) {
			const updatedRows = await db
				.update(eventParticipant)
				.set({
					cancelledParticipation: false,
					cancelledAt: null,
				})
				.where(eq(eventParticipant.id, existing.id))
				.returning();

			const registration = updatedRows[0];

			if (!registration) {
				throw new AppError('INTERNAL_ERROR', 'Erro ao reativar inscrição', 500);
			}

			return {
				id: registration.id,
				userId: registration.userId,
				eventId: registration.eventId,
				registeredAt: registration.registeredAt.toISOString(),
				cancelledParticipation: registration.cancelledParticipation,
				cancelledAt: registration.cancelledAt?.toISOString() ?? null,
				event: {
					id: event.id,
					title: event.title,
					description: event.description,
					location: event.location,
					startTime: event.startTime.toISOString(),
					finishTime: event.finishTime?.toISOString() ?? null,
					maxCapacity: event.maxCapacity,
				},
			};
		}

		// Check capacity if maxCapacity is set
		if (event.maxCapacity) {
			const [participantCountResult] = await db
				.select({ count: count(eventParticipant.id) })
				.from(eventParticipant)
				.where(
					and(
						eq(eventParticipant.eventId, eventId),
						eq(eventParticipant.cancelledParticipation, false)
					)
				)

			const participantCount = Number(participantCountResult?.count ?? 0)

			if (participantCount >= event.maxCapacity) {
				throw new AppError('EVENT_FULL', 'Evento lotado', 400)
			}
		}

		// Register using returning() for automatic typing
		const registrationRows = await db
			.insert(eventParticipant)
			.values({
				userId,
				eventId,
			})
			.returning()

		const registration = registrationRows[0]

		if (!registration) {
			throw new AppError('INTERNAL_ERROR', 'Erro ao registrar', 500)
		}

		return {
			id: registration.id,
			userId: registration.userId,
			eventId: registration.eventId,
			registeredAt: registration.registeredAt.toISOString(),
			cancelledParticipation: registration.cancelledParticipation,
			cancelledAt: registration.cancelledAt?.toISOString() ?? null,
			event: {
				id: event.id,
				title: event.title,
				description: event.description,
				location: event.location,
				startTime: event.startTime.toISOString(),
				finishTime: event.finishTime?.toISOString() ?? null,
				maxCapacity: event.maxCapacity,
			},
		}
	}

	static async getUserRegistrations(userId: string): Promise<RegistrationModel.getRegistrationsResponse> {
		// Fetch registrations with event details using Relational Query API
		const registrations = await db.query.eventParticipant.findMany({
			where: (eventParticipant, { eq }) => eq(eventParticipant.userId, userId),
			orderBy: (eventParticipant, { asc }) => [asc(eventParticipant.registeredAt)],
			with: {
				event: {
					columns: {
						id: true,
						title: true,
						description: true,
						location: true,
						startTime: true,
						finishTime: true,
						maxCapacity: true,
						cancelledAt: true,
					}
				}
			}
		})

		// Filter out cancelled events and map to response format
		return registrations
			.filter(reg => !reg.event.cancelledAt)
			.map(registration => ({
				id: registration.id,
				userId: registration.userId,
				eventId: registration.eventId,
				registeredAt: registration.registeredAt.toISOString(),
				cancelledParticipation: registration.cancelledParticipation,
				cancelledAt: registration.cancelledAt?.toISOString() ?? null,
				event: {
					id: registration.event.id,
					title: registration.event.title,
					description: registration.event.description,
					location: registration.event.location,
					startTime: registration.event.startTime.toISOString(),
					finishTime: registration.event.finishTime?.toISOString() ?? null,
					maxCapacity: registration.event.maxCapacity,
				},
			}))
	}

	static async cancelRegistration(registrationId: string, userId: string): Promise<RegistrationModel.cancelResponse> {
		const result = await db
			.update(eventParticipant)
			.set({
				cancelledParticipation: true,
				cancelledAt: new Date(),
			})
			.where(and(eq(eventParticipant.id, registrationId), eq(eventParticipant.userId, userId)))
			.returning()

		if (result.length === 0) {
			throw new AppError('NOT_FOUND', 'Inscrição não encontrada', 404)
		}

		return {
			message: 'Inscrição cancelada com sucesso',
		}
	}
}