# Blink-DG

A collection of Node.js utility scripts for interfacing with the Clarizen V2.0 REST API.

## Project Overview

This project provides helper functions to authenticate and retrieve data from Clarizen:

- **API_Keys.js** - Stores JWT-based API keys (primary and secondary)
- **Login_API.js** - Authenticates with the Clarizen API via POST request
- **Get_API.js** - Retrieves attachment data from the Clarizen API

## Tech Stack

- **Runtime:** Node.js 20
- **API:** Clarizen V2.0 REST API (`api.clarizen.com`)
- **HTTP:** Native `fetch` (built into Node.js 20+)

## Running the Project

```bash
node Login_API.js    # Run the login/authentication script
node Get_API.js      # Run the attachment retrieval script
node API_Keys.js     # View API key configuration
```

## User Preferences

- No external dependencies — uses native Node.js fetch API
- Scripts are standalone and can be run individually
