# Flutter frontend for The Nutritionist

This mobile frontend is a minimal Flutter app wired to the project's FastAPI backend.

Quick start

1. Make sure the backend is running locally: `uvicorn backend.main:app --reload` (default: http://127.0.0.1:8000)
2. From this folder run:

```bash
cd flutter_frontend
flutter pub get
flutter run
```

Notes
- When running on Android emulator use `10.0.2.2` to reach the host machine. The app defaults to that address.
- For real devices, set the `API_BASE` environment to your host address, e.g. `--dart-define=API_BASE=http://192.168.0.5:8000`.

Features implemented
- Capture/upload image, send to `/api/analyze` as multipart form `file`.
- Chat UI that posts to `/api/coach/chat` and appends replies.
- Simple results view that renders `AnalysisResponse` fields.
# flutter_frontend

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
