export function readUser() {
  try {
    return JSON.parse(localStorage.getItem("userInfo"));
  } catch {
    return null;
  }
}

export function saveUser(user) {
  if (user) localStorage.setItem("userInfo", JSON.stringify(user));
  else localStorage.removeItem("userInfo");
  window.dispatchEvent(new Event("chat-session-changed"));
}
