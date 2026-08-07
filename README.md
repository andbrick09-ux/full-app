# Ejac Training (PWA)

Private, offline-first pelvic floor training companion for force, control, and multiple-orgasm skill practice.

Solo use. All data stays in your browser (`localStorage`).

## Features

- Guided sessions with **sets + rest** (Foundation, Edging, Clamp, Multiple Orgasm, Recovery)
- Breathing ring on hold/clamp stages
- In-session **peak logging**
- Phase checkpoints, streaks, milestones, consistency chart
- Optional **sound cues** and **haptics**
- Daily reminder (notification when you open the app after reminder time, if enabled)
- Export / clear data


## Folder layout

All files are in **one flat folder** (no `css/` or `js/` subdirs). Drop the whole folder contents onto your GitHub Pages branch root or `/docs`.

## Deploy to GitHub Pages

1. Create a repo (or use an existing one), e.g. `ejac-training`.
2. Copy **everything in this folder** to the repo root (or a `/docs` folder if you prefer).
3. In GitHub → **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: `main` (or `master`)
   - Folder: `/ (root)` or `/docs` if you put files there
4. Wait a minute, then open:  
   `https://<your-username>.github.io/<repo-name>/`
5. On your phone (Chrome/Safari): open that URL → browser menu → **Add to Home Screen**.

### Subpath note

All asset paths are relative (`./css/...`, `./js/...`).  
If the app is served from a subpath (`/repo-name/`), it still works.

## Local test

```bash
cd ejac-training-deploy
python3 -m http.server 8765
# open http://127.0.0.1:8765
```

## Privacy

- No accounts, no server, no analytics
- Data only on device
- Export JSON anytime from Settings

## Reminders (honest limits)

Browsers cannot reliably fire notifications while the app is fully closed without a push server.  
This app:

1. Asks for notification permission when you enable Daily Reminder  
2. When you open the app after your reminder time and haven’t trained yet, shows a notification + toast  

For best results: install as PWA and open it once around your usual training time.

## Sound

Enable **Sound cues** in Settings. First enable may require a tap (browser autoplay policy). Soft tones for:

- Stage / set start  
- 3-second warning  
- Rest start  
- Stage complete  

## Suggested first week

1. Settings → set phase, hold time, sound/haptics, optional reminder  
2. Run **Foundation** 3–4×  
3. Add **Edging** when isolation feels solid  
4. Log honestly — body feel drives recovery recommendations  
