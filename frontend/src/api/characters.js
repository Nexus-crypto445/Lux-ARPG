const BASE = "https://lux11-aarpg.onrender.com/api/characters";
export async function fetchCharacters() {
  const res = await fetch(BASE);
  return res.json();
}

export async function createCharacter(payload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function updateCharacter(id, payload) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function deleteCharacter(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  return res.json();
}
