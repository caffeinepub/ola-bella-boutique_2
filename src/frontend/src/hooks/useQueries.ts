import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product } from "../backend";
import { useActor } from "./useActor";

export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

async function withActorRetry<T>(
  _actor: { getAllProducts: unknown } | null,
  fn: () => Promise<T>,
  retries = 2,
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      // Wait before retrying
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      price: number;
      description: string;
      productCode: string;
      category: string;
      imageId: string | null;
    }) => {
      if (!actor) throw new Error("No actor available");
      await withActorRetry(actor, () =>
        actor.addProduct(
          data.name,
          data.price,
          data.description,
          data.productCode,
          data.category,
          data.imageId,
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      price: number;
      description: string;
      productCode: string;
      category: string;
      imageId: string | null;
    }) => {
      if (!actor) throw new Error("No actor available");
      await withActorRetry(actor, () =>
        actor.updateProduct(
          data.id,
          data.name,
          data.price,
          data.description,
          data.productCode,
          data.category,
          data.imageId,
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor available");
      await withActorRetry(actor, () => actor.deleteProduct(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
