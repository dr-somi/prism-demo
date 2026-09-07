# PRISM live classroom prototype

This is a dependency-free interaction prototype for PRISM. It validates the classroom flow before the production backend and AI service are selected.

## Included in this prototype

- Student and instructor views in one browser
- Multiple prompts in one class session
- Independent response before peer responses are revealed
- Private interpretive reflection
- Original or clarified response sharing
- Anonymous, discipline-labeled class view
- Instructor prompt controls and an illustrative live summary
- Responsive phone and laptop layouts

## Run locally

Open `index.html` directly, or serve this directory with any static web server.

```bash
python3 -m http.server 8000 --directory prism
```

Then open `http://localhost:8000`.

## Prototype limitations

All state is held in the current browser tab. The AI reflection, response clarification, peer responses, and class summary are intentionally simulated. There is no authentication, database, network synchronization, or production AI call yet.

These limitations keep the first milestone focused on validating the classroom experience. The next milestone will replace simulated behavior with a server-side API and persistent session data.
