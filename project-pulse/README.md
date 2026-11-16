# Project Pulse for Android

This standalone, static PWA lives at https://nanobotco.github.io/project-pulse/.

Open in Chrome for Android; tap the three-dot menu and **Add to Home screen** (or **Install app**). It works without a Python backend or sign-in.

The frontend fetches public GitHub data. Notes and checkpoints use localStorage. **Important:** this path shares the nanobotco.github.io origin with other pages; browser storage is not a confidential vault. Do not store confidential notes here. For confidential use, move the whole app to a dedicated site origin before importing personal material.

This folder does not modify the root homepage or Motdang code. Browser requests to GitHub may be limited by its unauthenticated API rate caps. The app has no access to LINE, ChatGPT conversation history, or private GitHub repos.
