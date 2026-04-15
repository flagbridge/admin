"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ProductCard, ProductCardInput } from "@/lib/types";

export function useProductCard(projectSlug: string, flagKey: string) {
  return useQuery({
    queryKey: ["product-card", projectSlug, flagKey],
    queryFn: () =>
      api<ProductCard | null>(
        `/v1/projects/${projectSlug}/flags/${flagKey}/product-card`,
      ),
    enabled: !!projectSlug && !!flagKey,
  });
}

export function useUpsertProductCard(projectSlug: string, flagKey: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductCardInput) =>
      api<ProductCard>(
        `/v1/projects/${projectSlug}/flags/${flagKey}/product-card`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["product-card", projectSlug, flagKey],
      });
      qc.invalidateQueries({ queryKey: ["flag", projectSlug, flagKey] });
    },
  });
}

export function useDeleteProductCard(projectSlug: string, flagKey: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api<void>(
        `/v1/projects/${projectSlug}/flags/${flagKey}/product-card`,
        { method: "DELETE" },
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["product-card", projectSlug, flagKey],
      });
    },
  });
}
