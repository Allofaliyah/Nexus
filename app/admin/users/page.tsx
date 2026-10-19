
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  MoreVertical,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";
import { useAdmin } from "@/app/context/AdminContext";

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString();
}

export default function UsersPage() {
  const { users, loading, error, loadUsers } = useAdmin();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    void loadUsers().catch(() => {});
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.email
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      const matchesRole =
        roleFilter === "all" ||
        user.role.toLowerCase() === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Users size={28} />
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Users
            </h1>
          </div>

          <p className="mt-3 text-gray-500">
            Monitor users registered on the logistics platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadUsers().catch(() => {})}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() => void loadUsers().catch(() => {})}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Registered users</p>
          <p className="mt-2 text-2xl font-bold">{users.length}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Administrators</p>
          <p className="mt-2 text-2xl font-bold">
            {
              users.filter(
                (user) => user.role.toLowerCase() === "admin"
              ).length
            }
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by email..."
            className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 outline-none focus:border-slate-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="rounded-lg border bg-white px-3 py-2 outline-none focus:border-slate-500"
        >
          <option value="all">All roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        {loading && users.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Loading registered users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center">
            <UserRound
              size={36}
              className="mx-auto mb-3 text-gray-400"
            />

            <h2 className="font-semibold text-slate-900">
              No users found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error
                ? "Users could not be loaded. Check the error above."
                : "Try a different email or role filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-4 text-sm font-semibold">Email</th>
                  <th className="p-4 text-sm font-semibold">Role</th>
                  <th className="p-4 text-sm font-semibold">
                    Registered
                  </th>
                  <th className="p-4 text-sm font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-600">
                      {user.email}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                        {user.role}
                      </span>
                    </td>

                    <td className="p-4 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="relative p-4">
                      <button
                        type="button"
                        aria-label={`Actions for ${user.email}`}
                        aria-expanded={openMenu === user.id}
                        onClick={() =>
                          setOpenMenu(
                            openMenu === user.id ? null : user.id
                          )
                        }
                        className="rounded-lg p-2 hover:bg-gray-100"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenu === user.id && (
                        <div className="absolute right-4 top-12 z-10 w-44 rounded-lg border bg-white p-2 shadow-lg">
                          <p className="px-3 py-2 text-xs text-gray-500">
                            User information
                          </p>

                          <p className="break-all px-3 py-2 text-sm">
                            {user.email}
                          </p>

                          <p className="px-3 py-2 text-sm capitalize">
                            Role: {user.role}
                          </p>

                          <button
                            type="button"
                            onClick={() => setOpenMenu(null)}
                            className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Showing {filteredUsers.length} of {users.length} users.
      </p>
    </div>
  );
}
