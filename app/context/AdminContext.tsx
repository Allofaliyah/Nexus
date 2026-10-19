
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface AdminOrder {
  id: string;
  trackingNumber: string;
  userId: string;
  recipientName: string;
  status: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface SecurityAlert {
  id: string;
  userId: string | null;
  title: string;
  description: string;
  severity: string;
  status: string;
  source: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  alertId?: string | null;
  title: string;
  description: string;
  severity: string;
  status: string;
  assignedTo?: string | null;
  resolution?: string | null;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string | null;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: unknown;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  details: unknown;
  ipAddress: string | null;
  createdAt: string;
}

interface AdminContextType {
  orders: AdminOrder[];
  users: AdminUser[];
  alerts: SecurityAlert[];
  incidents: Incident[];
  selectedIncident: Incident | null;
  activity: UserActivity[];
  logs: AuditLog[];
  loading: boolean;
  error: string | null;

  loadOrders: () => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  loadUsers: () => Promise<void>;
  loadAlerts: () => Promise<void>;
  updateAlert: (
    id: string,
    status: "acknowledged" | "resolved"
  ) => Promise<void>;
  loadIncidents: () => Promise<void>;
  getIncident: (id: string) => Promise<Incident | null>;
  updateIncident: (
    id: string,
    input: Record<string, unknown>
  ) => Promise<void>;
  loadActivity: () => Promise<void>;
  loadLogs: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] =
    useState<Incident | null>(null);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback(async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.access_token) {
      throw new Error("Your session has expired. Please log in again.");
    }

    return session.access_token;
  }, []);

  const request = useCallback(
    async <T,>(
      url: string,
      options: RequestInit = {}
    ): Promise<T> => {
      const token = await getToken();

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          ...(options.body ? { "Content-Type": "application/json" } : {}),
        },
        cache: "no-store",
      });

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : `Request failed (${response.status})`;

        throw new Error(message);
      }

      return data as T;
    },
    [getToken]
  );

  const runLoad = useCallback(
    async (load: () => Promise<void>, fallback: string) => {
      setLoading(true);
      setError(null);

      try {
        await load();
      } catch (err) {
        const message = err instanceof Error ? err.message : fallback;
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadOrders = useCallback(
    () =>
      runLoad(async () => {
        const data = await request<{ orders: AdminOrder[] }>(
          "/api/admin/orders"
        );
        setOrders(data.orders ?? []);
      }, "Failed to load orders."),
    [request, runLoad]
  );

  const updateOrderStatus = useCallback(
    (id: string, status: string) =>
      runLoad(async () => {
        await request(`/api/admin/orders/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });

        const data = await request<{ orders: AdminOrder[] }>(
          "/api/admin/orders"
        );
        setOrders(data.orders ?? []);
      }, "Failed to update order status."),
    [request, runLoad]
  );

  const loadUsers = useCallback(
    () =>
      runLoad(async () => {
        const data = await request<{ users: AdminUser[] }>(
          "/api/admin/users"
        );
        setUsers(data.users ?? []);
      }, "Failed to load users."),
    [request, runLoad]
  );

  const loadAlerts = useCallback(
    () =>
      runLoad(async () => {
        const data = await request<{ alerts: SecurityAlert[] }>(
          "/api/admin/alerts"
        );
        setAlerts(data.alerts ?? []);
      }, "Failed to load alerts."),
    [request, runLoad]
  );

  const updateAlert = useCallback(
    (id: string, status: "acknowledged" | "resolved") =>
      runLoad(async () => {
        await request(`/api/admin/alerts/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });

        const data = await request<{ alerts: SecurityAlert[] }>(
          "/api/admin/alerts"
        );
        setAlerts(data.alerts ?? []);
      }, "Failed to update alert."),
    [request, runLoad]
  );

  const loadIncidents = useCallback(
    () =>
      runLoad(async () => {
        const data = await request<{ incidents: Incident[] }>(
          "/api/admin/incidents"
        );
        setIncidents(data.incidents ?? []);
      }, "Failed to load incidents."),
    [request, runLoad]
  );

  const getIncident = useCallback(
    async (id: string): Promise<Incident | null> => {
      setLoading(true);
      setError(null);

      try {
        // Fetch the incident list and find the requested incident.
        // The current API provides GET /api/admin/incidents, not GET /[id].
        const data = await request<{ incidents: Incident[] }>(
          "/api/admin/incidents"
        );

        setIncidents(data.incidents ?? []);

        const incident = data.incidents?.find((item) => item.id === id) ?? null;
        setSelectedIncident(incident);

        if (!incident) {
          throw new Error("Incident not found.");
        }

        return incident;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load incident."
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [request]
  );

  const updateIncident = useCallback(
    (id: string, input: Record<string, unknown>) =>
      runLoad(async () => {
        await request(`/api/admin/incidents/${id}`, {
          method: "PATCH",
          body: JSON.stringify(input),
        });

        const data = await request<{ incidents: Incident[] }>(
          "/api/admin/incidents"
        );
        const updatedIncidents = data.incidents ?? [];

        setIncidents(updatedIncidents);
        setSelectedIncident(
          updatedIncidents.find((item) => item.id === id) ?? null
        );
      }, "Failed to update incident."),
    [request, runLoad]
  );

  const loadActivity = useCallback(
    () =>
      runLoad(async () => {
        const data = await request<{ activity: UserActivity[] }>(
          "/api/admin/activity"
        );
        setActivity(data.activity ?? []);
      }, "Failed to load activity."),
    [request, runLoad]
  );

  const loadLogs = useCallback(
    () =>
      runLoad(async () => {
        const data = await request<{ logs: AuditLog[] }>("/api/admin/logs");
        setLogs(data.logs ?? []);
      }, "Failed to load audit logs."),
    [request, runLoad]
  );

  return (
    <AdminContext.Provider
      value={{
        orders,
        users,
        alerts,
        incidents,
        selectedIncident,
        activity,
        logs,
        loading,
        error,
        loadOrders,
        updateOrderStatus,
        loadUsers,
        loadAlerts,
        updateAlert,
        loadIncidents,
        getIncident,
        updateIncident,
        loadActivity,
        loadLogs,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("useAdmin must be used inside AdminProvider.");
  }

  return context;
}
