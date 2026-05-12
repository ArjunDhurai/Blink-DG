const { clarizenLogin } = require("./Login_API");

const BASE_URL = "https://api.clarizen.com/v2.0/services";

function normalizeLinkId(linkId) {
  const match = linkId.match(/\/ExpenseEntryAttachmentLink\/(.+)$/);
  return match ? match[1] : linkId;
}

function normalizeExpenseId(entityId) {
  const match = entityId.match(/\/(?:Expense|ExpenseEntry)\/(.+)$/);
  return match ? match[1] : entityId;
}

async function getAttachmentByLinkId(linkId) {
  console.log("Logging in to Clarizen...");
  const session = await clarizenLogin();

  if (!session || !session.sessionId) {
    console.error("Login failed:");
    console.error(JSON.stringify(session, null, 2));
    return;
  }

  const rawLinkId = normalizeLinkId(linkId);
  console.log("Session ID:", session.sessionId);
  console.log("--------------------------------------------------");
  console.log("Fetching attachment link by id:", linkId);
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
  const match = entities.find((row) => {
    const value = row?.id || "";
    return String(value).includes(rawLinkId);
  });

  if (!match) {
    console.log("Attachment Response:");
    console.log(JSON.stringify(data, null, 2));
    return data;
  }

  const output = { entity: match };
  console.log("Attachment Link Response:");
  console.log(JSON.stringify(output, null, 2));

  const expenseId = match?.Entity?.id;
  if (expenseId) {
    const cleanedExpenseId = normalizeExpenseId(expenseId);
    const expenseResponse = await fetch(
      `${BASE_URL}/data/objects/Expense/${cleanedExpenseId}?fields=Name`,
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

const LINK_ID = process.argv[2] || "/ExpenseEntryAttachmentLink/2hywthvt3oxp395diba6mexiw1313";

getAttachmentByLinkId(LINK_ID);
