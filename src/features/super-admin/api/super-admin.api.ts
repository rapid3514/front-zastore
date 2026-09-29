import { z } from "zod";
import { api } from "@/shared/api/api";
import { parseUsersPage } from '@/features/users/model/user.schemas'
import type { ManagedUserRole, UsersPage } from '@/features/users/model/user.types'
import type { AdminUser, SuperAdminStats, UpdateAdminInput } from "../types/super-admin.types";

export interface GetSuperAdminUsersParams {
  page: number
  limit: number
  search?: string
  role?: ManagedUserRole
  online?: boolean
}

const adminUserSchema = z.object({
  id: z.string().uuid(),
  telegramId: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  role: z.enum(["CUSTOMER", "ADMIN", "SUPER_ADMIN"]),
  isBlocked: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const superAdminStatsSchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  onlineUsers: z.number().int().nonnegative(),
  totalCustomers: z.number().int().nonnegative(),
  onlineCustomers: z.number().int().nonnegative(),
  totalAdmins: z.number().int().nonnegative(),
  onlineAdmins: z.number().int().nonnegative(),
})

function parseAdmin(data: unknown): AdminUser {
  return adminUserSchema.parse(data);
}

export const superAdminApi = {
  async getDashboardStats(): Promise<SuperAdminStats> {
    const { data } = await api.get<unknown>('/super-admin/dashboard/stats')
    return superAdminStatsSchema.parse(data)
  },

  async getUsers(params: GetSuperAdminUsersParams): Promise<UsersPage> {
    const { data } = await api.get<unknown>('/super-admin/users', { params })
    return parseUsersPage(data)
  },

  async getMyAdminProfile(): Promise<AdminUser> {
    const { data } = await api.get<unknown>("/admins/me");
    return parseAdmin(data);
  },

  async getAdmins(): Promise<AdminUser[]> {
    const { data } = await api.get<unknown>("/admins");
    return z
      .array(adminUserSchema)
      .parse(data)
      .filter((admin) => admin.role === "ADMIN");
  },

  async getAdmin(userId: string): Promise<AdminUser> {
    const { data } = await api.get<unknown>(`/admins/${userId}`);
    return parseAdmin(data);
  },

  async promoteAdmin(userId: string): Promise<AdminUser> {
    const { data } = await api.patch<unknown>(`/admins/${userId}/promote`);
    return parseAdmin(data);
  },

  async updateAdmin(
    userId: string,
    input: UpdateAdminInput,
  ): Promise<AdminUser> {
    const { data } = await api.patch<unknown>(`/admins/${userId}`, input);
    return parseAdmin(data);
  },

  async blockAdmin(userId: string): Promise<AdminUser> {
    const { data } = await api.patch<unknown>(`/admins/${userId}/block`);
    return parseAdmin(data);
  },

  async unblockAdmin(userId: string): Promise<AdminUser> {
    const { data } = await api.patch<unknown>(`/admins/${userId}/unblock`);
    return parseAdmin(data);
  },

  async demoteAdmin(userId: string): Promise<AdminUser> {
    const { data } = await api.patch<unknown>(`/admins/${userId}/demote`);
    return parseAdmin(data);
  },
};
