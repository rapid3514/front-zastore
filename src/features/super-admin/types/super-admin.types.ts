export type AdminRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";

export interface AdminUser {
  id: string;
  telegramId: string;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  phone?: string | null;
  role: AdminRole;
  isBlocked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateAdminInput {
  firstName?: string;
  lastName?: string;
  username?: string;
}

export type AdminFilter = "all" | "active" | "blocked";

export interface SuperAdminStats {
  totalUsers: number;
  onlineUsers: number;
  totalCustomers: number;
  onlineCustomers: number;
  totalAdmins: number;
  onlineAdmins: number;
}
