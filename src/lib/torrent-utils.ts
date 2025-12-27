import type { Preferences } from "@/hooks/use-torrents";
import type { PendingTorrent } from "@/store/torrent-store";

export function parseTorrentInput(
  input: string | File[],
  preferences: Preferences | undefined,
): PendingTorrent[] {
  // Handle file upload
  if (Array.isArray(input)) {
    return input.map((file) => ({
      id: crypto.randomUUID(),
      type: "file" as const,
      source: file,
      category: "unknown",
      savePath: preferences?.save_path || "",
    }));
  }

  // Handle multi-line URLs
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((url) => ({
      id: crypto.randomUUID(),
      type: "url" as const,
      source: url,
      category: "unknown",
      savePath: preferences?.save_path || "",
    }));
}

export function buildFormData(pending: PendingTorrent): FormData {
  const formData = new FormData();

  if (pending.type === "url") {
    formData.append("urls", pending.source as string);
  } else {
    formData.append("torrents", pending.source as File);
  }

  if (pending.category) {
    formData.append("category", pending.category);
  }

  if (pending.savePath) {
    formData.append("savepath", pending.savePath);
  }

  return formData;
}
