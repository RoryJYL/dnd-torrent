export function createQBittorrentClient(baseUrl: string) {
  return {
    login(username: string, password: string) {
      return fetch(
        `${baseUrl}/api/v2/auth/login?username=${username}&password=${password}`,
      );
    },

    checkAuth(cookie: string) {
      return fetch(`${baseUrl}/api/v2/app/version`, {
        headers: {
          Cookie: cookie,
        },
      });
    },

    getTorrents(cookie: string) {
      return fetch(`${baseUrl}/api/v2/torrents/info`, {
        headers: {
          Cookie: cookie,
        },
      });
    },

    getCategories(cookie: string) {
      return fetch(`${baseUrl}/api/v2/torrents/categories`, {
        headers: {
          Cookie: cookie,
        },
      });
    },

    getPreferences(cookie: string) {
      return fetch(`${baseUrl}/api/v2/app/preferences`, {
        headers: {
          Cookie: cookie,
        },
      });
    },

    addTorrent(cookie: string, body: ArrayBuffer, contentType: string) {
      return fetch(`${baseUrl}/api/v2/torrents/add`, {
        method: "POST",
        headers: {
          Cookie: cookie,
          "Content-Type": contentType,
        },
        body,
      });
    },
  };
}

export type QBittorrentClient = ReturnType<typeof createQBittorrentClient>;
