const { clarizenLogin } = require("./Login_API");

const BASE_URL = "https://api.clarizen.com/v2.0/services";

function normalizeEntityId(entityId) {
  const match = entityId.match(/\/(?:[A-Za-z]+)\/(\d+)/);
  return match ? match[1] : entityId;
}

function entityToExpenseId(entityId) {
  const match = entityId.match(/\/Expense\/(.+)$/);
  return match ? match[1] : entityId;
}

async function getAttachments(entityId) {
  console.log("Logging in to Clarizen...");
  const session = await clarizenLogin();

  if (!session || !session.sessionId) {
    console.error("Login failed:");
    console.error(JSON.stringify(session, null, 2));
    return;
  }

  const rawId = normalizeEntityId(entityId);
  console.log("Session ID:", session.sessionId);
  console.log("--------------------------------------------------");
  console.log("Fetching attachments for entity:", entityId);
  console.log("--------------------------------------------------");

  const response = await fetch(`${BASE_URL}/data/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Session ${session.sessionId}`,
    },
    body: JSON.stringify({
      q: `Select Entity, CreatedOn, CreatedBy From ExpenseEntryAttachmentLink`,
    }),
  });

  const data = await response.json();
  const entities = Array.isArray(data.entities) ? data.entities : [];
  const filtered = entities.filter((row) => {
    const value = row?.Entity?.id || row?.Entity || "";
    return String(value).includes(rawId);
  });

  const output = filtered.length > 0 ? { entities: filtered } : data;
  console.log("Attachment Response:");
  console.log(JSON.stringify(output, null, 2));

  const firstEntityId = output?.entities?.[0]?.Entity?.id;
  if (firstEntityId) {
    const expenseId = entityToExpenseId(firstEntityId);
    const expenseResponse = await fetch(
      `${BASE_URL}/data/objects/Expense/${expenseId}?fields=Name`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Session ${session.sessionId}`,
        },
      }
    );
    const expenseData = await expenseResponse.json();
    console.log("Expense Response:");
    console.log(JSON.stringify(expenseData, null, 2));
  }

  return output;
}

const ENTITY_ID = process.argv[2] || "/ExpenseEntry/556194113";

getAttachments(ENTITY_ID);
