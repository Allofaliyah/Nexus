
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

export interface Order {
  id: string;
  trackingNumber: string;
  userId: string;
  recipientName: string;
  recipientPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageType: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  userId?: string;
  orderId?: string | null;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

interface CreateOrderInput {
  recipientName: string;
  recipientPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageType: string;
  description?: string;
}

interface UserContextType {
  orders: Order[];
  selectedOrder: Order | null;
  notifications: Notification[];
  unreadCount: number;
  tracking: unknown;
  loading: boolean;
  error: string | null;
  loadOrders: () => Promise<void>;
  createOrder: (input: CreateOrderInput) => Promise<Order | null>;
  getOrder: (id: string) => Promise<Order | null>;
  cancelOrder: (id: string) => Promise<void>;
  trackOrder: (number: string) => Promise<unknown>;
  loadNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tracking, setTracking] = useState<unknown>(null);
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

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch("/api/user/orders", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load orders.");
      }

      setOrders(data.orders ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const createOrder = useCallback(
    async (input: CreateOrderInput): Promise<Order | null> => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const response = await fetch("/api/user/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create order.");
        }

        await loadOrders();
        return data.order ?? null;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create order.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken, loadOrders]
  );

  const getOrder = useCallback(
    async (id: string): Promise<Order | null> => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const response = await fetch(`/api/user/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load order.");
        }

        const order = data.order ?? null;
        setSelectedOrder(order);
        return order;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  const cancelOrder = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const response = await fetch(`/api/user/orders/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: "cancel" }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to cancel order.");
        }

        await loadOrders();

        if (selectedOrder?.id === id) {
          await getOrder(id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to cancel order.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken, loadOrders, getOrder, selectedOrder]
  );

  const trackOrder = useCallback(
    async (number: string) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const response = await fetch(
          `/api/user/tracking?number=${encodeURIComponent(number)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to track order.");
        }

        setTracking(data);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to track order.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch("/api/user/notifications", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load notifications.");
      }

      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load notifications."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const markNotificationRead = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const response = await fetch(`/api/user/notifications/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update notification.");
        }

        await loadNotifications();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update notification."
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken, loadNotifications]
  );

  return (
    <UserContext.Provider
      value={{
        orders,
        selectedOrder,
        notifications,
        unreadCount,
        tracking,
        loading,
        error,
        loadOrders,
        createOrder,
        getOrder,
        cancelOrder,
        trackOrder,
        loadNotifications,
        markNotificationRead,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider.");
  }

  return context;
}
