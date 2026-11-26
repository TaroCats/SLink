const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const idx = args.indexOf(name);
  if (idx === -1) return fallback;
  const v = args[idx + 1];
  return v ?? fallback;
};

const base = getArg("--base", "http://127.0.0.1:8080");
const changePassword = args.includes("--change-password");

async function request(method, path, token, body) {
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg = json?.error || `${method} ${path} failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}

function isoPlusDays(days) {
  const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  d.setMilliseconds(0);
  return d.toISOString();
}

async function main() {
  const login = await request("POST", "/api/admin/login", null, {
    username: "admin",
    password: "admin123",
  });
  const token = login.token;
  if (!token) throw new Error("Missing token from login");

  const short = await request("POST", "/api/shorten", null, {
    url: "https://example.com",
    expires_at: isoPlusDays(1),
    password: "pw1",
  });
  const code = short.short_code;
  if (!code) throw new Error("Missing short_code from shorten");

  const links = await request("GET", "/api/admin/links", token);
  const link = (links.data || []).find((x) => x.short_code === code);
  if (!link) throw new Error("Link not found in admin list");
  if (link.has_password !== 1) throw new Error("Expected has_password=1");
  if (!link.expires_at) throw new Error("Expected expires_at to be set");

  await request("PATCH", `/api/admin/links/${link.id}`, token, {
    expires_at: null,
    password: null,
  });

  const links2 = await request("GET", "/api/admin/links", token);
  const link2 = (links2.data || []).find((x) => x.id === link.id);
  if (!link2) throw new Error("Updated link not found in admin list");
  if (link2.has_password !== 0) throw new Error("Expected has_password=0 after clear");
  if (link2.expires_at !== null) throw new Error("Expected expires_at=null after clear");

  await request("DELETE", `/api/admin/links/${link.id}`, token);

  if (changePassword) {
    const newPw = "admin12345";
    await request("POST", "/api/admin/account", token, {
      current_password: "admin123",
      new_password: newPw,
    });
    const login2 = await request("POST", "/api/admin/login", null, {
      username: "admin",
      password: newPw,
    });
    if (!login2.token) throw new Error("Missing token from re-login");

    // Rename the account, then rename it back
    await request("POST", "/api/admin/account", token, {
      current_password: newPw,
      new_username: "admin2",
    });
    const login3 = await request("POST", "/api/admin/login", null, {
      username: "admin2",
      password: newPw,
    });
    if (!login3.token) throw new Error("Missing token after rename");
    await request("POST", "/api/admin/account", token, {
      current_password: newPw,
      new_username: "admin",
    });
  }

  process.stdout.write("SMOKE TEST PASSED\n");
}

main().catch((e) => {
  process.stderr.write(`${e?.message || e}\n`);
  process.exit(1);
});

