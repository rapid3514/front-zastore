import { z } from "zod";
import { api } from "@/shared/api/api";
import { queryKeys } from "@/shared/query/query-keys";

export const productMediaTypes = ["IMAGE", "VIDEO"] as const;
export type ProductMediaType = (typeof productMediaTypes)[number];
export const productAvailabilityStatuses = ["IN_STOCK", "ARRIVING_IN_14_DAYS", "OUT_OF_STOCK"] as const;
export type ProductAvailabilityStatus = (typeof productAvailabilityStatuses)[number];

const imageVariantsSchema = z.object({
  thumbnail: z.string().url(),
  card: z.string().url(),
  detail: z.string().url(),
  srcSet: z.string(),
});

export type ProductImageVariants = z.infer<typeof imageVariantsSchema>;

const productMediaSchema = z.object({
  id: z.string().nullable().optional(),
  type: z.enum(productMediaTypes),
  // Public product responses intentionally omit the private ImageKit fileId.
  fileId: z.string().optional(),
  url: z.string().url(),
  position: z.number().int().nonnegative(),
  mimeType: z.string().nullable().optional(),
  width: z.number().int().nullable().optional(),
  height: z.number().int().nullable().optional(),
  variants: imageVariantsSchema.nullable().optional(),
  posterUrl: z.string().url().nullable().optional(),
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
  description: z.string().nullable().optional().default(null),
  price: z.string(),
  cargoPrice: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional().default(null),
  imageVariants: imageVariantsSchema.nullable().optional(),
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
  availabilityStatus: z.enum(productAvailabilityStatuses),
  createdAt: z.string().optional().default(''),
  updatedAt: z.string().optional().default(''),
});

export type Product = z.infer<typeof productSchema>;
export interface ProductInput {
  name: string;
  description?: string | null;
  price: number;
  cargoPrice?: number;
  categoryId: string;
  media?: ProductMediaInput[];
  availabilityStatus?: ProductAvailabilityStatus;
}
export interface ProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  availabilityStatus?: ProductAvailabilityStatus;
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
  publicAll: queryKeys.public.products(),
  adminAll: queryKeys.admin.products(),
  list: (params: ProductsParams) =>
    queryKeys.public.products("list", params),
  manage: (params: ProductsParams) =>
    queryKeys.admin.products("list", params),
  detail: (id: string) => queryKeys.public.products("detail", id),
  manageDetail: (id: string) =>
    queryKeys.admin.products("detail", id),
};

export const productsApi = {
  async getProducts(params: ProductsParams, signal?: AbortSignal): Promise<ProductsPage> {
    const { data } = await api.get<unknown>("/products", { params, signal });
    return productsPageSchema.parse(data);
  },
  async getManageProducts(params: ProductsParams, signal?: AbortSignal): Promise<ProductsPage> {
    const { data } = await api.get<unknown>("/products/manage", { params, signal });
    return productsPageSchema.parse(data);
  },
  async getProductById(id: string, signal?: AbortSignal): Promise<Product> {
    const { data } = await api.get<unknown>(`/products/${id}`, { signal });
    return productSchema.parse(data);
  },
  async getManageProductById(id: string, signal?: AbortSignal): Promise<Product> {
    const { data } = await api.get<unknown>(`/products/manage/${id}`, { signal });
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
