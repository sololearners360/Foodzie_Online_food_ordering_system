* Add the db connection string in backend/auth.js/db.js
* Create a `.env` file and add the following credentials
          MONGO_URL=
          JWT_SECRET=
          SALT=
          STRIPE_SECRET_KEY=

## Choosing an LLM provider

* For beginners, prefer a hosted API such as OpenAI GPT to avoid managing custom infrastructure.
* Create an API key in the provider console and store it securely in `.env` (never commit it) or a secrets manager that your deployment platform supports.
* Review the provider’s pricing and rate limits to confirm they align with your expected traffic before shipping features that rely on the model.
   
