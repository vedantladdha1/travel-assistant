# Travel Assistant Platform

A lightweight web platform for planning travel with core features:

- Login/profile setup (stored in browser local storage)
- Destination-based trip itinerary generation
- Saved trips management
- Community tips board
- Trip analytics dashboard
- Transport search for flights, trains, and buses

## How to preview it locally

1. Open a terminal in the project folder:
   ```bash
   cd /workspace/travel-assistant
   ```
2. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```
3. In your browser, open:
   - <http://localhost:8000>
   - or <http://127.0.0.1:8000/index.html>

## Quick check (optional)

You can verify the page is being served with:

```bash
curl -I http://127.0.0.1:8000/index.html
```

You should see a `200 OK` response.
