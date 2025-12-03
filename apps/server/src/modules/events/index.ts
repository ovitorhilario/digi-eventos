import auth from "@/middleware/auth";
import { Elysia } from "elysia";
import { EventService } from "./service";
import { EventModel } from "./model";

export const eventRoutes = new Elysia({ name: "event-routes", prefix: "/events" })
	.use(auth)
	.get("/", async () => {
		return await EventService.getEvents();
	}, {
		auth: true,
		response: EventModel.getEventsResponse,
	})
	.get("/:id", async ({ params }) => {
		return await EventService.getEventById(params.id);
	}, {
		auth: true,
		response: {
			200: EventModel.getEventResponse,
			404: EventModel.eventNotFound,
		},
	})
	.post("/", async ({ body, user }) => {
		return await EventService.createEvent(body, user.userId);
	}, {
		body: EventModel.createEventBody,
		response: EventModel.createEventResponse,
		auth: { roles: ["admin", "owner"] },
	})
	.put("/:id", async ({ params, body }) => {
		return await EventService.updateEvent(params.id, body);
	}, {
		body: EventModel.updateEventBody,
		response: EventModel.updateEventResponse,
		auth: { roles: ["admin", "owner"] },
	})
	.delete("/:id", async ({ params }) => {
		return await EventService.deleteEvent(params.id);
	}, {
		response: {
			200: EventModel.deleteEventResponse,
			404: EventModel.deleteEventInvalid,
		},
		auth: { roles: ["admin", "owner"] },
	});