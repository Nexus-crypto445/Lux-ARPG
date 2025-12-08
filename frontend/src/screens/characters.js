// simple API wrapper for characters
// BASE should be your backend url root + /api/characters
// Update API_URL if your backend URL differs
const API_URL = process.env.REACT_APP_API_URL || "https://lux11-aarpg.onrender.com";
const BASE = `${API_URL}/api/characters`;

export async function fetchCharacters() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Failed to fetch characters");
  return res.json();
}

export async function createCharacter(payload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create character");
  return res.json();
}

export async function updateCharacter(id, payload) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update character");
  return res.json();
}

export async function deleteCharacter(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete character");
  return res.json();
}
