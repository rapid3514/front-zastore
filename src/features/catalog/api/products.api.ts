import { z } from "zod";
import { api } from "@/shared/api/api";

export const productMediaTypes = ["IMAGE", "VIDEO"] as const;
export type ProductMediaType = (typeof productMediaTypes)[number];

const productMediaSchema = z.object({
  id: z.string().optional(),
  type: z.enum(productMediaTypes),
  // Public product responses intentionally omit the private ImageKit fileId.
  fileId: z.string().optional(),
  url: z.string().url(),
  position: z.number().int().nonnegative(),
  mimeType: z.string().nullable().optional(),
  width: z.number().int().nullable().optional(),
  height: z.number().int().nullable().optional(),
});

export type ProductMedia = z.infer<typeof productMediaSchema>;
export interface ProductMediaInput {
  type: ProductMediaType;
  fileId: string;
  url: string;
  position: number;
}
export type TelegramSyncStatus = "PENDING" | "SYNCED" | "FAILED";

const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.string(),
  imageUrl: z.string().nullable().optional().default(null),
  imageFileId: z.string().nullable().optional(),
  media: z.array(productMediaSchema).optional().default([]),
  telegramSyncStatus: z.enum(["PENDING", "SYNCED", "FAILED"]).optional(),
  telegramChannelMessageId: z.number().int().nullable().optional(),
  telegramButtonMessageId: z.number().int().nullable().optional(),
  telegramPublishedAt: z.string().nullable().optional(),
  telegramSyncedAt: z.string().nullable().optional(),
  categoryId: z.string().uuid(),
  category: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
  }),
  isAvailable: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Product = z.infer<typeof productSchema>;
export interface ProductInput {
  name: string;
  description?: string | null;
  price: number;
  categoryId: string;
  media?: ProductMediaInput[];
  isAvailable?: boolean;
  isActive?: boolean;
}
export interface ProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  isAvailable?: boolean;
  isActive?: boolean;
}

const productsPageSchema = z.object({
  data: z.array(productSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export type ProductsPage = z.infer<typeof productsPageSchema>;

export const productKeys = {
  all: ["products"] as const,
  list: (params: ProductsParams) =>
    [...productKeys.all, "public", params] as const,
  manage: (params: ProductsParams) =>
    [...productKeys.all, "manage", params] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
  manageDetail: (id: string) =>
    [...productKeys.all, "manage-detail", id] as const,
};

export const productsApi = {
  async getProducts(params: ProductsParams): Promise<ProductsPage> {
    const { data } = await api.get<unknown>("/products", { params });
    return productsPageSchema.parse(data);
  },
  async getManageProducts(params: ProductsParams): Promise<ProductsPage> {
    const { data } = await api.get<unknown>("/products/manage", { params });
    return productsPageSchema.parse(data);
  },
  async getProductById(id: string): Promise<Product> {
    const { data } = await api.get<unknown>(`/products/${id}`);
    return productSchema.parse(data);
  },
  async getManageProductById(id: string): Promise<Product> {
    const { data } = await api.get<unknown>(`/products/manage/${id}`);
    return productSchema.parse(data);
  },
  async createProduct(input: ProductInput): Promise<Product> {
    const { data } = await api.post<unknown>("/products", input);
    return productSchema.parse(data);
  },
  async updateProduct(
    id: string,
    input: Partial<ProductInput>,
  ): Promise<Product> {
    const { data } = await api.patch<unknown>(`/products/${id}`, input);
    return productSchema.parse(data);
  },
  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
  async syncTelegram(id: string, forceRepublish = false): Promise<Product> {
    const { data } = await api.post<unknown>(
      `/products/${id}/telegram/sync`,
      forceRepublish ? { forceRepublish: true } : {},
    );
    return productSchema.parse(data);
  },
};
