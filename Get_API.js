const { clarizenLogin } = require("./Login_API");

const ATTACHMENT_URL = "https://api.clarizen.com/v2.0/services/attachment/get";

async function getAttachment(entityId) {
  // Step 1: Login to get a session
  console.log("Logging in to Clarizen...");
  const session = await clarizenLogin();

  if (!session || !session.sessionId) {
    console.error("Login failed. Cannot proceed.");
    console.error(session);
    return;
  }

  console.log("Login successful. Session ID:", session.sessionId);
  console.log("--------------------------------------------------");

  // Step 2: Call the attachment API
  console.log(`Fetching attachment for entity: ${entityId}`);

  const response = await fetch(ATTACHMENT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Session ${session.sessionId}`,
    },
    body: JSON.stringify({
      entityId: entityId,
    }),
  });

  const data = await response.json();

  console.log("--------------------------------------------------");
  console.log("Attachment API Response:");
  console.log(JSON.stringify(data, null, 2));

  return data;
}

// Entry point — replace with the actual Clarizen entity ID you want to query
const ENTITY_ID = "/WorkItem/12345";

getAttachment(ENTITY_ID);
