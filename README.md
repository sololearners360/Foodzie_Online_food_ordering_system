## Environment setup

### Backend

1. Copy `backend/.env.example` to `backend/.env` and fill in the values:
   - `PORT` – server port (defaults to `4000` if not set).
   - `MONGO_URL` – MongoDB connection string.
   - `JWT_SECRET` – JWT signing secret.
   - `SALT` – bcrypt salt rounds.
   - `STRIPE_SECRET_KEY` – Stripe secret key for payments.
   - `AI_API_KEY` – API key for your AI provider.
   - `AI_MODEL` – model name (defaults to `gpt-4o-mini`).
   - `AI_BASE_URL` – optional custom base URL for compatible providers.
   - `CORS_ORIGINS` – comma-separated list of allowed origins (e.g., `https://app.example.com,https://admin.example.com`).

### Frontend

1. Copy `frontend/.env.example` to `frontend/.env` and set:
   - `VITE_API_BASE_URL` – URL of the backend API (e.g., `http://localhost:4000`).

> Note: `.env` files are ignored by Git—only commit the example templates.

### Deployment environment

Set the same backend environment variables (`AI_API_KEY`, `AI_MODEL`, and optional `AI_BASE_URL`) in your hosting provider's secrets UI so the chat assistant can run in production. When the frontend is served from a different domain than the API, also configure `CORS_ORIGINS` with the list of allowed frontend origins.

## Choosing an LLM provider

* For beginners, prefer a hosted API such as OpenAI GPT to avoid managing custom infrastructure.
* Create an API key in the provider console and store it securely in `.env` (never commit it) or a secrets manager that your deployment platform supports.
* Review the provider’s pricing and rate limits to confirm they align with your expected traffic before shipping features that rely on the model.
   
