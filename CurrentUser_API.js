const { clarizenLogin } = require("./Login_API");

const BASE_URL = "https://api.clarizen.com/v2.0/services";

async function getCurrentUser() {
  console.log("Logging in to Clarizen...");
  const session = await clarizenLogin();

  if (!session || !session.sessionId) {
    console.error("Login failed:");
    console.error(JSON.stringify(session, null, 2));
    return;
  }

  console.log("Session ID:", session.sessionId);
  console.log("User ID   :", session.userId);
  console.log("--------------------------------------------------");
  console.log("Fetching current user details...");
  console.log("--------------------------------------------------");

  const fields = "Name,Email,FirstName,LastName,Username";
  const url = `${BASE_URL}/data/objects/User/${session.userId}?fields=${fields}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Session ${session.sessionId}`,
    },
  });

  const data = await response.json();
  console.log("Current User Response:");
  console.log(JSON.stringify(data, null, 2));
  return data;
}

getCurrentUser();
