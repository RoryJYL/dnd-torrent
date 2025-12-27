interface Torrent {
  hash: string;
  name: string;
  progress: number;
  category?: string;
  state: string;
}

interface TorrentItemProps {
  torrent: Torrent;
}

function TorrentItem({ torrent }: TorrentItemProps) {
  return (
    <div className="border rounded-lg p-4 space-y-1">
      <div className="flex justify-between items-start">
        <p className="font-medium">{torrent.name}</p>
      </div>
      <div className="text-xs text-muted-foreground">
        <span>Category: {torrent.category || "None"}</span>
      </div>
    </div>
  );
}

interface TorrentListProps {
  torrents: Torrent[];
}

export function TorrentList({ torrents }: TorrentListProps) {
  if (!torrents || torrents.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No torrents found
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {torrents.map((torrent) => (
        <TorrentItem key={torrent.hash} torrent={torrent} />
      ))}
    </div>
  );
}
