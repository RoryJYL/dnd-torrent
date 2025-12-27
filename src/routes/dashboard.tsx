import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { TorrentList } from "@/components/torrent-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddTorrents,
  useGetCategories,
  useGetPreferences,
  useGetTorrents,
} from "@/hooks/use-torrents";
import { parseTorrentInput } from "@/lib/torrent-utils";
import { useAuthStore } from "@/store/auth-store";
import { useTorrentStore } from "@/store/torrent-store";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ location }) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      throw redirect({
        to: "/",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: DashboardRouteComponent,
});

function DashboardRouteComponent() {
  const [urlInput, setUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState<number | null>(null);

  const { pending, addPending, updatePending, removePending, clearPending } =
    useTorrentStore();
  const { data: existing, refetch } = useGetTorrents();
  const { data: categories } = useGetCategories();
  const { data: preferences } = useGetPreferences();
  const addMutation = useAddTorrents();

  const handleAddUrls = () => {
    if (!urlInput.trim()) {
      return;
    }
    addPending(parseTorrentInput(urlInput, preferences));
    setUrlInput("");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.name.endsWith(".torrent"),
    );

    if (files.length > 0) {
      addPending(parseTorrentInput(files, preferences));
    }
  };

  const handleSubmitAll = async () => {
    const submitTime = Math.floor(Date.now() / 1000);
    setLastSubmitTime(submitTime);

    const failed = await addMutation.mutateAsync(pending);

    if (failed.length === 0) {
      clearPending();
    } else {
      const failedIds = new Set(failed.map((f) => f.id));
      for (const p of pending) {
        if (!failedIds.has(p.id)) {
          removePending(p.id);
        }
      }
    }

    refetch();
  };

  const handleCategoryChange = (id: string, value: string) => {
    const savePath =
      value === "unknown"
        ? preferences?.save_path || ""
        : categories?.[value]?.savePath || "";
    updatePending(id, {
      category: value,
      savePath,
    });
  };

  const categoryKeys = categories ? Object.keys(categories) : [];

  const recentlyAddedTorrents = lastSubmitTime
    ? (existing || []).filter(
        (torrent) => torrent.added_on >= lastSubmitTime - 5,
      )
    : [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Input Area */}
      <Card>
        <CardHeader>
          <CardTitle>Add Torrents</CardTitle>
          <CardDescription>
            Paste torrent links or upload .torrent files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            className={`w-full border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/25"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p className="text-muted-foreground">
              Drag and drop .torrent files here
            </p>
          </button>
          <div>
            <Textarea
              placeholder="Paste torrent links (one per line)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleAddUrls();
                }
              }}
            />
            <Button onClick={handleAddUrls} className="mt-2">
              Add URLs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending List */}
      {pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pending.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-sm break-all">
                      {typeof item.source === "string"
                        ? item.source
                        : item.source.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.type === "url" ? "URL" : "File"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePending(item.id)}
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`category-${item.id}`}>Category</Label>
                    <Select
                      value={item.category}
                      onValueChange={(value) =>
                        handleCategoryChange(item.id, value)
                      }
                    >
                      <SelectTrigger
                        className="w-full"
                        id={`category-${item.id}`}
                      >
                        <SelectValue placeholder="Unknown" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unknown">Unknown</SelectItem>
                        {categoryKeys.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2 col-span-2">
                    <Label htmlFor={`savepath-${item.id}`}>Save Path</Label>
                    <Input
                      id={`savepath-${item.id}`}
                      value={item.savePath}
                      onChange={(e) =>
                        updatePending(item.id, { savePath: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              onClick={handleSubmitAll}
              disabled={addMutation.isPending}
              className="w-full"
            >
              {addMutation.isPending
                ? "Submitting..."
                : `Start Download (${pending.length})`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recently Added Torrents */}
      {lastSubmitTime && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Added</CardTitle>
            <CardDescription>
              Torrents added in the last submission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TorrentList torrents={recentlyAddedTorrents} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
