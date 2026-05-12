const { clarizenLogin } = require("./Login_API");

const URL =
  "https://api.clarizen.com/v2.0/services/attachment/gethttps://api.clarizen.com/v2.0/services/data/currentuser";

async function getAttachment(entityId) {
  const session = await clarizenLogin();

  if (!session || !session.sessionId) {
    console.error("Login failed:");
    console.error(session);
    return;
  }

  const response = await fetch(URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Session ${session.sessionId}`,
    },
    // body: JSON.stringify({ entityId }),
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
  return data;
}

// Replace with a real Clarizen entity ID
const ENTITY_ID = process.argv[2] || "/WorkItem/12345";

getAttachment(ENTITY_ID);
