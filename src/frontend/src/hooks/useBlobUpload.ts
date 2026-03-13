import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";

/**
 * Hook to upload a file to Caffeine blob storage and return a direct URL.
 * This avoids storing large base64 images in the backend canister.
 */
export function useBlobUpload() {
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    try {
      const config = await loadConfig();
      const agent = new HttpAgent({ host: config.backend_host });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );

      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, (pct) => {
        setProgress(pct);
      });
      const url = await storageClient.getDirectURL(hash);
      setProgress(100);
      return url;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { uploadFile, progress, isUploading };
}
