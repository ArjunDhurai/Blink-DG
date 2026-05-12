const http = require("http");
const { clarizenLogin } = require("./Login_API");

const ATTACHMENT_URL = "https://api.clarizen.com/v2.0/services/attachment/get";
const PORT = 5000;

async function getAttachment(entityId) {
  const session = await clarizenLogin();
  if (!session || !session.sessionId) {
    return { error: "Login failed", details: session };
  }

  const response = await fetch(ATTACHMENT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Session ${session.sessionId}`,
    },
    body: JSON.stringify({ entityId }),
  });

  const data = await response.json();
  return { session, attachment: data };
}

function renderHTML(entityId, result, error) {
  const json = result ? JSON.stringify(result, null, 2) : null;
  const isError = !result || result.attachment?.errorCode || error;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Blink-DG | API Output</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#0f1117;--surface:#1a1d27;--surface2:#22263a;
      --border:#2e3352;--accent:#4f7cff;
      --success:#22c55e;--error:#ef4444;
      --text:#e8eaf6;--muted:#7a82a8;
    }
    body{background:var(--bg);color:var(--text);font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column;}

    header{display:flex;align-items:center;gap:14px;padding:16px 28px;border-bottom:1px solid var(--border);background:var(--surface);}
    .logo{width:38px;height:38px;background:linear-gradient(135deg,#4f7cff,#a78bfa);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:17px;color:#fff;flex-shrink:0;}
    .brand h1{font-size:17px;font-weight:700;}
    .brand p{font-size:12px;color:var(--muted);margin-top:2px;}

    main{flex:1;padding:28px 32px;display:flex;flex-direction:column;gap:20px;max-width:960px;width:100%;margin:0 auto;}

    .form-row{display:flex;gap:10px;align-items:flex-end;}
    .field{flex:1;}
    label{display:block;font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;}
    input[type=text]{width:100%;padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s;}
    input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(79,124,255,.18);}
    button{padding:10px 22px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;}
    button:hover{background:#3a64f0;}

    .result-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;}
    .result-header{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid var(--border);background:var(--surface2);}
    .result-title{font-size:13px;font-weight:600;color:var(--muted);display:flex;align-items:center;gap:8px;}
    .badge{padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;}
    .badge-ok{background:rgba(34,197,94,.15);color:var(--success);}
    .badge-err{background:rgba(239,68,68,.15);color:var(--error);}
    .copy-btn{padding:5px 12px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--muted);font-size:12px;cursor:pointer;}
    .copy-btn:hover{border-color:var(--accent);color:var(--accent);}
    pre{padding:20px;font-size:13px;line-height:1.7;font-family:'Cascadia Code','Fira Code','Courier New',monospace;overflow-x:auto;white-space:pre-wrap;word-break:break-word;}

    .json-key{color:#79c0ff}
    .json-str{color:#a5d6ff}
    .json-num{color:#f2cc60}
    .json-bool{color:#ff7b72}
    .json-null{color:#6e7681}

    .sections{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
    @media(max-width:660px){.sections{grid-template-columns:1fr}}
  </style>
</head>
<body>

<header>
  <div class="logo">B</div>
  <div class="brand">
    <h1>Blink-DG</h1>
    <p>Clarizen V2.0 API Output</p>
  </div>
</header>

<main>
  <form method="GET" action="/">
    <div class="form-row">
      <div class="field">
        <label for="entityId">Entity ID</label>
        <input type="text" id="entityId" name="entityId" value="${entityId}" placeholder="/WorkItem/12345"/>
      </div>
      <button type="submit">Fetch</button>
    </div>
  </form>

  ${error ? `<div class="result-card"><pre style="color:var(--error)">${error}</pre></div>` : ""}

  ${result ? `
  <div class="sections">

    <div class="result-card">
      <div class="result-header">
        <span class="result-title">
          Session
          <span class="badge badge-ok">Connected</span>
        </span>
        <button class="copy-btn" onclick="copy('session')">Copy</button>
      </div>
      <pre id="session">${highlight(result.session)}</pre>
    </div>

    <div class="result-card">
      <div class="result-header">
        <span class="result-title">
          Attachment Response
          <span class="badge ${isError ? "badge-err" : "badge-ok"}">${isError ? "Error" : "OK"}</span>
        </span>
        <button class="copy-btn" onclick="copy('attachment')">Copy</button>
      </div>
      <pre id="attachment">${highlight(result.attachment)}</pre>
    </div>

  </div>
  ` : ""}
</main>

<script>
function copy(id){
  navigator.clipboard.writeText(document.getElementById(id).innerText);
}
</script>
</body>
</html>`;
}

function highlight(obj) {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "json-num";
      if (/^"/.test(match)) cls = /:$/.test(match) ? "json-key" : "json-str";
      else if (/true|false/.test(match)) cls = "json-bool";
      else if (/null/.test(match)) cls = "json-null";
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const entityId = url.searchParams.get("entityId") || "/WorkItem/12345";

  res.writeHead(200, { "Content-Type": "text/html" });

  try {
    const result = await getAttachment(entityId);
    res.end(renderHTML(entityId, result, null));
  } catch (err) {
    res.end(renderHTML(entityId, null, err.message));
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Blink-DG running on http://0.0.0.0:${PORT}`);
});
