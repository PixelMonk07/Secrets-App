const adjectives = ["cyber", "shadow", "astro", "code", "thunder", "solar", "neon"];
const animals = ["ferret", "shark", "ape", "coyote", "tiger", "scorpion", "fox"];

const createAlias = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adjective}_${animal}`;
};

export const generateUniqueAlias = async (client) => {
  let alias = createAlias();
  let attempts = 0;
  let result = await client.query("SELECT 1 FROM users WHERE anonymous_name = $1", [alias]);

  while (result.rows.length > 0) {
    alias = createAlias();
    attempts += 1;
    if (attempts > 20) throw new Error("Unable to generate a unique alias");
    let result = await client.query("SELECT 1 FROM users WHERE anonymous_name = $1", [alias]);
  }

  return alias;
};

export const ensureAnonymousName = async (userId, client) => {
  const existing = await client.query("SELECT anonymous_name FROM users WHERE id = $1", [userId]);

  if (existing.rows[0]?.anonymous_name) {
    return existing.rows[0].anonymous_name;
  }

  const alias = await generateUniqueAlias(client);
  await client.query("UPDATE users SET anonymous_name = $1 WHERE id = $2", [alias, userId]);
  return alias;
};