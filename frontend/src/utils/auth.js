const TOKEN_KEY = "token";
const USER_KEY = "user";

export function setSession(user, token, remember) {
  // Clear BOTH storages first. getUser()/getToken() check localStorage
  // before sessionStorage — without this, logging in again without
  // "Remember Me" (e.g. using an admin access code on a second login)
  // writes the fresh session to sessionStorage while a stale user object
  // from an earlier "Remember Me" login still sits in localStorage, which
  // then wins and makes the new session invisible everywhere (role,
  // name, "View As" — all stuck showing the old account).
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);

  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(USER_KEY, JSON.stringify(user));
  storage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return (
    localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
  );
}

export function getUser() {
  const raw =
    localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);

  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
