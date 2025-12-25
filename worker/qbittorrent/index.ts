const BASE_URL = "http://jortana.tech:9000";

export async function login(username: string, password: string) {
  return fetch(
    `${BASE_URL}/api/v2/auth/login?username=${username}&password=${password}`,
  );
}

export async function checkAuth(cookie: string) {
  return fetch(`${BASE_URL}/api/v2/app/version`, {
    headers: {
      Cookie: cookie,
    },
  });
}
