import { z } from "zod";
import { api } from "@/shared/api/api";
import type { AdminUser, UpdateAdminInput } from "../types/super-admin.types";

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

function parseAdmin(data: unknown): AdminUser {
  return adminUserSchema.parse(data);
}

export const superAdminApi = {
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
