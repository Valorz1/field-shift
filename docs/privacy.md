# Privacy

Rotara is built so that a farmer can use it without giving away anything they don't need to.

- **No account, no ads and no trackers.**
- **The place you pick** is sent to Mapbox (to draw the map and find the place) and to our server, which asks NASA POWER for that spot's data. Our server does not save it, though our hosting services (Vercel and Render) keep short request logs.
- **Your crop and your answers about the farm** are kept in memory in your browser tab only, and are gone when you refresh, end the session or close the tab. There is no database.
- **Mapbox's anonymous id** is cleared from your browser.
- **Secrets** (such as API keys) live in untracked `.env` files and are never committed to the repository.

The same statement is on the live site: https://rotara-chi.vercel.app/about#privacy

Before any real-world use beyond this hackathon prototype, Rotara would need a full privacy and security review.
