import auth from "@/middleware/auth";
import { Elysia, t } from "elysia";
import { RegistrationService } from "./service";
import { RegistrationModel } from "./model";

export const registrationRoutes = new Elysia({ prefix: "/registrations" })
	.use(auth)
	.post("/", async ({ body, user }) => {
		return await RegistrationService.registerForEvent(body.eventId, user.userId);
	}, {
		auth: true,
		body: RegistrationModel.registerBody,
		response: {
			200: RegistrationModel.registerResponse,
			400: t.Union([RegistrationModel.registrationInvalid, RegistrationModel.eventFull]),
			404: RegistrationModel.eventNotFound,
		},
	})
	.get("/", async ({ user }) => {
		return await RegistrationService.getUserRegistrations(user.userId);
	}, {
		auth: true,
		response: RegistrationModel.getRegistrationsResponse,
	})
	.delete("/:id", async ({ params, user }) => {
		console.log('Cancelling registration for ID:', params.id, 'by user:', user.userId);
		return await RegistrationService.cancelRegistration(params.id, user.userId);
	}, {
		auth: true,
		response: {
			200: RegistrationModel.cancelResponse,
			404: RegistrationModel.registrationNotFound,
		},
	});