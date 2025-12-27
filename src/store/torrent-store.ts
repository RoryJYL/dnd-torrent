import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface PendingTorrent {
  id: string;
  type: "url" | "file";
  source: string | File;
  category: string;
  savePath: string;
}

interface TorrentStore {
  pending: PendingTorrent[];
  addPending: (items: PendingTorrent[]) => void;
  removePending: (id: string) => void;
  updatePending: (
    id: string,
    updates: Partial<Pick<PendingTorrent, "category" | "savePath">>,
  ) => void;
  clearPending: () => void;
}

export const useTorrentStore = create<TorrentStore>()(
  immer((set) => ({
    pending: [],

    addPending: (items) =>
      set((state) => {
        state.pending.push(...items);
      }),

    removePending: (id) =>
      set((state) => {
        state.pending = state.pending.filter((item) => item.id !== id);
      }),

    updatePending: (id, updates) =>
      set((state) => {
        const item = state.pending.find((item) => item.id === id);
        if (item) {
          Object.assign(item, updates);
        }
      }),

    clearPending: () => set({ pending: [] }),
  })),
);
