const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Fetch all characters
export async function fetchCharacters() {
  const res = await fetch(`${API_URL}/characters`);
  if (!res.ok) throw new Error("Failed to fetch characters");
  return res.json();
}

// Update a character
export async function updateCharacter(id, updates) {
  const res = await fetch(`${API_URL}/characters/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!res.ok) throw new Error("Failed to update character");
  return res.json();
}

// Delete a character
export async function deleteCharacter(id) {
  const res = await fetch(`${API_URL}/characters/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete character");
  return res.json();
}
