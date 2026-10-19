
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

// ========================================
// ENUMS
// ========================================

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "admin",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "in_transit",
  "delivered",
  "cancelled",
  "failed",
]);

export const severityEnum = pgEnum("soc_severity", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const alertStatusEnum = pgEnum("soc_alert_status", [
  "new",
  "acknowledged",
  "resolved",
]);

export const incidentStatusEnum = pgEnum("soc_incident_status", [
  "open",
  "investigating",
  "contained",
  "resolved",
  "closed",
]);

// ========================================
// 1. PROFILES
// Your existing table
// ========================================

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).notNull().defaultNow(),
});

// ========================================
// 2. ORDERS
// ========================================

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trackingNumber: varchar("tracking_number", {
      length: 100,
    }).notNull().unique(),

    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id),

    recipientName: varchar("recipient_name", {
      length: 255,
    }).notNull(),

    recipientPhone: varchar("recipient_phone", {
      length: 30,
    }).notNull(),

    pickupAddress: text("pickup_address").notNull(),
    deliveryAddress: text("delivery_address").notNull(),
    packageType: varchar("package_type", {
      length: 100,
    }).notNull(),

    description: text("description"),

    status: orderStatusEnum("status")
      .notNull()
      .default("pending"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    index("orders_user_id_idx").on(table.userId),
    index("orders_status_idx").on(table.status),
  ]
);

// ========================================
// 3. ORDER STATUS HISTORY
// ========================================

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),

    changedBy: uuid("changed_by").references(() => profiles.id, {
      onDelete: "set null",
    }),

    previousStatus: orderStatusEnum("previous_status"),
    newStatus: orderStatusEnum("new_status").notNull(),
    note: text("note"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    index("order_history_order_id_idx").on(table.orderId),
  ]
);

// ========================================
// 4. NOTIFICATIONS
// ========================================

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),

    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "set null",
    }),

    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),

    readAt: timestamp("read_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
  ]
);

// ========================================
// 5. USER ACTIVITY
// Security monitoring records
// ========================================

export const userActivity = pgTable(
  "user_activity",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id").references(() => profiles.id, {
      onDelete: "set null",
    }),

    action: varchar("action", { length: 100 }).notNull(),
    description: text("description"),
    ipAddress: varchar("ip_address", { length: 100 }),
    userAgent: text("user_agent"),

    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    index("user_activity_user_id_idx").on(table.userId),
    index("user_activity_created_at_idx").on(table.createdAt),
  ]
);

// ========================================
// 6. SOC ALERTS
// ========================================

export const socAlerts = pgTable(
  "soc_alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id").references(() => profiles.id, {
      onDelete: "set null",
    }),

    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),

    severity: severityEnum("severity")
      .notNull()
      .default("medium"),

    status: alertStatusEnum("status")
      .notNull()
      .default("new"),

    source: varchar("source", { length: 100 }),

    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),

    acknowledgedBy: uuid("acknowledged_by").references(
      () => profiles.id,
      { onDelete: "set null" }
    ),

    resolvedAt: timestamp("resolved_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    index("soc_alerts_status_idx").on(table.status),
    index("soc_alerts_severity_idx").on(table.severity),
  ]
);

// ========================================
// 7. SOC INCIDENTS
// ========================================

export const socIncidents = pgTable(
  "soc_incidents",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    alertId: uuid("alert_id").references(() => socAlerts.id, {
      onDelete: "set null",
    }),

    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),

    severity: severityEnum("severity")
      .notNull()
      .default("medium"),

    status: incidentStatusEnum("status")
      .notNull()
      .default("open"),

    assignedTo: uuid("assigned_to").references(
      () => profiles.id,
      { onDelete: "set null" }
    ),

    resolution: text("resolution"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    resolvedAt: timestamp("resolved_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    index("soc_incidents_status_idx").on(table.status),
    index("soc_incidents_severity_idx").on(table.severity),
  ]
);

// ========================================
// 8. AUDIT LOGS
// ========================================

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    actorId: uuid("actor_id").references(() => profiles.id, {
      onDelete: "set null",
    }),

    action: varchar("action", { length: 100 }).notNull(),
    resourceType: varchar("resource_type", {
      length: 100,
    }).notNull(),

    resourceId: varchar("resource_id", { length: 255 }),

    details: jsonb("details")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),

    ipAddress: varchar("ip_address", { length: 100 }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_logs_actor_id_idx").on(table.actorId),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ]
);
