const { clarizenLogin } = require("./Login_API");

const BASE_URL = "https://api.clarizen.com/v2.0/services";

async function getAttachments(entityId) {
  console.log("Logging in to Clarizen...");
  const session = await clarizenLogin();

  if (!session || !session.sessionId) {
    console.error("Login failed:");
    console.error(JSON.stringify(session, null, 2));
    return;
  }

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
      q: `Select Entity, CreatedOn, CreatedBy From WorkItemAttachmentLink Where Entity = '${entityId}'`,
    }),
  });

  const data = await response.json();
  console.log("Attachment Response:");
  console.log(JSON.stringify(data, null, 2));
  return data;
}

// Usage: node Get_API.js /WorkItem/12345
const ENTITY_ID = process.argv[2] || "/WorkItem/6805469249";
getAttachments(ENTITY_ID);
