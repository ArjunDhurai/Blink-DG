// Generate api Script
async function clarizenLogin() {
  
  const url = "https://api.clarizen.com/v2.0/services/authentication/login";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userName: "Omkumar",
      password: "Xponential@123",
    }),
  });

  const data = await response.json();
  console.log(data);
  return data;
}

clarizenLogin();
