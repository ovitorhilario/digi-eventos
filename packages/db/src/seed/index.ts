import { drizzle } from "drizzle-orm/node-postgres";
import { users, events, categories, eventCategory, eventParticipant } from "../schema";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
	throw new Error("DATABASE_URL is not set");
}

export const db = drizzle(dbUrl);

async function seed() {
  console.log("🌱 Starting database seed...");

  // Hash passwords
  const adminPassword = await Bun.password.hash("admin", {
    algorithm: "bcrypt",
    cost: 10,
  });
  const userPassword = await Bun.password.hash("password", {
    algorithm: "bcrypt",
    cost: 10,
  });

  // Create users
  const usersData = await db.insert(users).values([
    {
      email: "owner@digi.com",
      name: "Owner",
      password: adminPassword,
      role: "owner"
    },
    {
      email: "admin@digi.com",
      name: "Administrador",
      password: adminPassword,
      role: "admin"
    },
    {
      email: "joao.silva@email.com",
      name: "João Silva",
      password: userPassword,
      role: "user"
    },
    {
      email: "maria.santos@email.com",
      name: "Maria Santos",
      password: userPassword,
      role: "user"
    }
  ]).returning();

  const [user1, user2, user3] = usersData;

  console.log("✅ Users created");

  // Create categories
  const categoriesData = await db.insert(categories).values([
    {
      title: "Tecnologia",
      description: "Eventos relacionados a tecnologia, programação e inovação"
    },
    {
      title: "Negócios",
      description: "Eventos empresariais, networking e empreendedorismo"
    },
    {
      title: "Educação",
      description: "Cursos, workshops e eventos educacionais"
    },
    {
      title: "Entretenimento",
      description: "Shows, espetáculos e eventos culturais"
    }
  ]).returning();

  const [techCategory, businessCategory, educationCategory, entertainmentCategory] = categoriesData;

  console.log("✅ Categories created");

  // Create events
  const eventsData = await db.insert(events).values([
    {
      title: "Workshop de React Avançado",
      description: "Aprenda as melhores práticas do React com hooks, context API e performance optimization",
      location: "Centro de Convenções - São Paulo",
      startTime: new Date("2025-11-15T09:00:00Z"),
      finishTime: new Date("2025-11-15T17:00:00Z"),
      maxCapacity: 50,
      createdBy: user1!.id
    },
    {
      title: "Networking Empresarial 2025",
      description: "Conecte-se com empreendedores e profissionais de diversos setores",
      location: "Hotel Grand Plaza - Rio de Janeiro",
      startTime: new Date("2025-12-01T18:00:00Z"),
      finishTime: new Date("2025-12-01T22:00:00Z"),
      maxCapacity: 100,
      createdBy: user2!.id
    },
    {
      title: "Curso de TypeScript para Iniciantes",
      description: "Introdução completa ao TypeScript com exemplos práticos",
      location: "Online - Zoom",
      startTime: new Date("2025-10-25T14:00:00Z"),
      finishTime: new Date("2025-10-25T18:00:00Z"),
      maxCapacity: 30,
      createdBy: user1!.id
    },
    {
      title: "Festival de Música Eletrônica",
      description: "A maior festa de música eletrônica da cidade com DJs internacionais",
      location: "Arena Eventos - Belo Horizonte",
      startTime: new Date("2025-12-20T22:00:00Z"),
      finishTime: new Date("2025-12-21T06:00:00Z"),
      maxCapacity: 2000,
      createdBy: user3!.id
    }
  ]).returning();

  const [event1, event2, event3, event4] = eventsData;

  console.log("✅ Events created");

  // Associate events with categories
  await db.insert(eventCategory).values([
    // Workshop React - Tecnologia
    { eventId: event1!.id, categoryId: techCategory!.id },
    // Networking - Negócios
    { eventId: event2!.id, categoryId: businessCategory!.id },
    // TypeScript Course - Tecnologia e Educação
    { eventId: event3!.id, categoryId: techCategory!.id },
    { eventId: event3!.id, categoryId: educationCategory!.id },
    // Festival Música - Entretenimento
    { eventId: event4!.id, categoryId: entertainmentCategory!.id }
  ]);

  console.log("✅ Event-Category associations created");

  // Add some participants to events
  await db.insert(eventParticipant).values([
    // João no Workshop React
    {
      userId: user2!.id,
      eventId: event1!.id,
      registeredAt: new Date("2025-10-20T10:00:00Z")
    },
    // Maria no Networking
    {
      userId: user3!.id,
      eventId: event2!.id,
      registeredAt: new Date("2025-10-21T15:00:00Z")
    },
    // João no TypeScript Course
    {
      userId: user2!.id,
      eventId: event3!.id,
      registeredAt: new Date("2025-10-22T12:00:00Z")
    },
    // Maria no Festival
    {
      userId: user3!.id,
      eventId: event4!.id,
      registeredAt: new Date("2025-10-23T09:00:00Z")
    }
  ]);

  console.log("✅ Event participants added");

  console.log("🎉 Database seed completed successfully!");
}

// Run the seed
seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});