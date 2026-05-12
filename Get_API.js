const { clarizenLogin } = require("./Login_API");

const BASE_URL = "https://api.clarizen.com/v2.0/services";

function normalizeId(value) {
  const match = value.match(/\/(?:[A-Za-z]+)\/(.+)$/);
  return match ? match[1] : value;
}

async function getAttachmentByTransactionId(transactionId) {
  console.log("Logging in to Clarizen...");
  const session = await clarizenLogin();

  if (!session || !session.sessionId) {
    console.error("Login failed:");
    console.error(JSON.stringify(session, null, 2));
    return;
  }

  const rawTransactionId = normalizeId(transactionId);
  console.log("Session ID:", session.sessionId);
  console.log("--------------------------------------------------");
  console.log("Fetching attachment link for transaction id:", transactionId);
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
    const rowTransactionId = normalizeId(row?.Entity?.id || "");
    return rowTransactionId === rawTransactionId;
  });

  if (!match) {
    console.log("Attachment Response:");
    console.log(JSON.stringify(data, null, 2));
    return data;
  }

  console.log("Attachment Link Response:");
  console.log(JSON.stringify({ entity: match }, null, 2));

  const expenseId = match?.Entity?.id;
  if (expenseId) {
    const cleanedExpenseId = normalizeId(expenseId);
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

  return match;
}

const TRANSACTION_ID = process.argv[2] || "/Expense/6yyvnzllntgy7hyr4q110mggh131";

getAttachmentByTransactionId(TRANSACTION_ID);
