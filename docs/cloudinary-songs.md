# Cloudinary karaoke audio setup (OffPitch)

## Important: what goes where

| Asset | Where it lives | Why |
|---|---|---|
| **MP3 audio** (`him-i_m.mp3`, `Gallan_Goodiyaan_m.mp3`) | **Cloudinary** folder `offpitch/songs` | CDN streaming for all users |
| **Lyrics JSON** (`Him_i.json`, `Gallan_Goodiyaan.json`) | **Postgres** `song_detail.timeline` | Seeded by backend from `backend/src/main/resources/songs/` |

**You do NOT need to upload JSON files to Cloudinary.**  
Lyrics are already copied into the backend classpath and inserted into the database on first startup by `SongCatalogSeeder`.

Flow:

```text
Cloudinary  →  MP3 URL
Postgres    →  song metadata + lyrics timeline
Backend     →  returns both + song_started_at (sync clock)
Frontend    →  plays Cloudinary audio + scrolls lyrics for everyone
```

---

## Checklist — what to verify (and where)

### 1) Cloudinary Media Library

Path: **Media Library → Folders → `offpitch` → `songs`**

You should see **2 audio assets** (your screenshot already shows this):

- `him-i_m` (or similar)
- `Gallan_Goodiyaan_m`

For each file:

1. Open the `⋯` menu → **Copy URL**
2. Paste into a browser tab — it should start downloading/playing audio
3. Note the URL shape. We expect something like:

```text
https://res.cloudinary.com/<CLOUD_NAME>/video/upload/…/offpitch/songs/him-i_m
```

or with `.mp3` at the end.

If Copy URL uses `/raw/upload/` instead of `/video/upload/`, tell the backend by storing the **full URL** in `song.audio_url` (or re-upload as resource type **video**).

**Public IDs the seeder expects:**

| File | Expected public_id |
|---|---|
| `him-i_m.mp3` | `offpitch/songs/him-i_m` |
| `Gallan_Goodiyaan_m.mp3` | `offpitch/songs/Gallan_Goodiyaan_m` |

If Cloudinary renamed them, either rename in Cloudinary or update `song.audio_url` in the DB.

### 2) Backend `.env`

File: `backend/.env`

Must include:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=offpitch/songs
```

Restart the Spring Boot app after editing.

### 3) Database (Supabase / Postgres)

After backend restart, check tables:

- `song` → 2 rows (Him & I, Gallan Goodiyaan)
- `song_detail` → 2 rows with `timeline` JSON containing `lyrics[]`

If `song` is empty, seeder did not run (or failed). Check backend logs for `Seeding karaoke song catalog…`.

If songs were seeded **before** Cloudinary was configured, URLs may be wrong. Fix options:

1. Delete rows from `song_detail` then `song`, restart backend (seeder runs again), **or**
2. Update `song.audio_url` to the exact public_id / full Copy URL from Cloudinary

### 4) API smoke tests (while logged in)

With backend on `:8080` and a valid Google Bearer token:

| Call | Expect |
|---|---|
| `GET /api/songs` | List of songs with `https://…cloudinary…` `audioUrl` |
| Create session → open karaoke house | **Select a Song** UI |
| Host selects a song | `playback` appears with `audioUrl`, `startedAt`, `timeline.lyrics` |
| Second user joins same Room ID | Same song + lyrics, synced to the same start time |

### 5) Frontend sync

Already implemented:

1. Host selects song → `POST /api/sessions/{code}/songs/{songId}`
2. Backend sets `session.song_started_at = now()`
3. Every client polls `GET /api/sessions/{code}`
4. Each client computes `elapsed = now - startedAt` (with server clock skew)
5. `<audio src={cloudinaryUrl}>` seeks to that elapsed time
6. Lyrics highlight from `timeline.lyrics[].startMs`

So **all users in the room hear/see the same place in the song**.

---

## Lyrics without uploading JSON to Cloudinary

Local files:

```text
karaoke_songs/Him_i.json
karaoke_songs/Gallan_Goodiyaan.json
```

were copied to:

```text
backend/src/main/resources/songs/him_i.json
backend/src/main/resources/songs/gallan_goodiyaan.json
```

On first boot, `SongCatalogSeeder` reads those JSON files and stores them in:

```text
song_detail.timeline = {
  "lyrics": [
    { "line": 1, "startMs": 94, "endMs": 5999, "text": "..." }
  ],
  "effects": []
}
```

When the host picks a song, the session response includes that timeline for every member. No Cloudinary JSON needed.

---

## Upload MP3s (if you need to redo)

### Media Library UI

1. `offpitch/songs` → **Upload**
2. Upload `him-i_m.mp3` and `Gallan_Goodiyaan_m.mp3`
3. Prefer resource type **video** for audio delivery URLs

### CLI

```bash
$env:CLOUDINARY_URL="cloudinary://<API_KEY>:<API_SECRET>@<CLOUD_NAME>"

cld uploader upload him-i_m.mp3 resource_type=video folder=offpitch/songs public_id=him-i_m
cld uploader upload Gallan_Goodiyaan_m.mp3 resource_type=video folder=offpitch/songs public_id=Gallan_Goodiyaan_m
```

---

## Adding a new song later

1. Upload MP3 to Cloudinary `offpitch/songs`
2. Add lyrics JSON under `backend/src/main/resources/songs/`
3. Insert `song` + `song_detail` (or extend `SongCatalogSeeder`)
4. Keep `audio_url` as Cloudinary public_id **or** full Copy URL

---

## Troubleshooting

| Symptom | Check |
|---|---|
| Song list empty | Backend logs + `song` table rows |
| `audioUrl` has no `https://` | `CLOUDINARY_CLOUD_NAME` in `.env` + restart |
| Audio 404 | Copy URL from Cloudinary; public_id mismatch; `/video/` vs `/raw/` |
| Lyrics missing | `song_detail.timeline` JSON; seeder classpath files |
| Joiner not in sync | Joiner must be in same session; poll returns `playback.startedAt` |
| Autoplay blocked | Browser may require one tap; host select usually unlocks for host |
