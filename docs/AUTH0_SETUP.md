# Auth0 Setup For BenchOS

BenchOS uses the official Auth0 React SDK for primary login.

## Current Auth0 App

These values are public SPA client settings, not secrets:

```text
Domain: appbenchos.us.auth0.com
Client ID: Y0a2nfZcrGrwkAFWpeeHn6CoZPmcwCKh
Application Type: Single Page Application
Token Endpoint Auth Method: None
```

## Local Development

Run BenchOS on the fixed Vite port:

```bash
npm run dev -- --host 127.0.0.1
```

The project script already includes:

```text
--port 5173 --strictPort
```

That matters because Auth0 will reject login if the browser URL does not exactly match an allowed callback URL.

## Auth0 Dashboard URLs

In the Auth0 dashboard, open the BenchOS application and add these values.

Allowed Callback URLs:

```text
http://localhost:5173, http://127.0.0.1:5173, https://appbenchos.com
```

Allowed Logout URLs:

```text
http://localhost:5173, http://127.0.0.1:5173, https://appbenchos.com
```

Allowed Web Origins:

```text
http://localhost:5173, http://127.0.0.1:5173, https://appbenchos.com
```

Save the Auth0 application after adding the URLs.

## Netlify

The app includes the Auth0 domain and client ID as public defaults. If you want to manage them from Netlify instead, add these environment variable names in Netlify:

```text
VITE_AUTH0_DOMAIN
VITE_AUTH0_CLIENT_ID
```

Do not add Auth0 client secrets to this frontend app.

## Testing

1. Start the app with `npm run dev -- --host 127.0.0.1`.
2. Open `http://127.0.0.1:5173`.
3. Choose **Continue with Auth0**.
4. Finish login in Auth0 Universal Login.
5. Confirm BenchOS returns to the app and opens account onboarding or the dashboard.
6. Use Account or the top-right account menu to log out.

If Auth0 says callback mismatch, the URL in the browser is missing from Allowed Callback URLs.
