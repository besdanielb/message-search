export function saveState(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeState(key) {
  localStorage.removeItem(key);
}

export function getState(key) {
  return JSON.parse(localStorage.getItem(key));
}
