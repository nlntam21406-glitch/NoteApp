================================================================
  NOTEAPP - WEB PROGRAMMING FINAL PROJECT
  503073 - WEB PROGRAMMING & APPLICATIONS | Semester II/2025-2026
================================================================

----------------------------------------------------------------
TEAM MEMBERS
----------------------------------------------------------------
Nguyen Le Nhat Tam - 524H0186
Nguyen Gia Phat - 524H0117
Le Do Minh Thanh - 524H0030

----------------------------------------------------------------
PROJECT LINKS
----------------------------------------------------------------
PUBLIC URL: https://note-app-blond-psi.vercel.app
DEMO VIDEO: https://drive.google.com/file/d/1KWF65CebB2MXr3_MooVLThSMqb2gPMwS/view?usp=sharing

----------------------------------------------------------------
ACCOUNTS FOR GRADING (pre-loaded)
----------------------------------------------------------------
Admin / Owner :  admin@noteapp.com      / Password123!
Recipient     :  user2@noteapp.com      / Password123!
(Only admin@noteapp.com has sample notes already created)

----------------------------------------------------------------
TECH STACK
----------------------------------------------------------------
Backend  : Laravel 11 + Laravel Sanctum + Laravel Reverb (WebSocket)
Frontend : React 18 + Vite + Bootstrap 5
Database : MySQL 8
PWA      : Service Worker + IndexedDB (idb)
Deploy   : Docker Compose

================================================================
  OPTION A — DOCKER COMPOSE (RECOMMENDED)
================================================================

PREREQUISITES: Docker Desktop installed and running.

STEP 1 — Configure email (optional, for verification/reset emails)
  Copy .env.example to .env in backend/ and set:
    MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD
  (Use Gmail App Password for testing — as pre-configured in .env.docker)

STEP 2 — Build and start
  docker compose up --build -d

STEP 3 — Generate app key (first run only)
  docker exec noteapp_backend php artisan key:generate

STEP 4 — Run migrations + seed demo data
  docker exec noteapp_backend php artisan migrate --force
  docker exec noteapp_backend php artisan db:seed --force

STEP 5 — Open in browser
  http://localhost

STEP 6 — Stop
  docker compose down

================================================================
  OPTION B — LOCAL DEVELOPMENT (Manual)
================================================================

PREREQUISITES: PHP 8.2+, Composer 2, Node 20+, MySQL 8

─── BACKEND SETUP ────────────────────────────────────────────

  cd backend
  composer install
  cp .env.example .env
  php artisan key:generate

  Edit .env:
    DB_HOST=127.0.0.1
    DB_DATABASE=noteapp
    DB_USERNAME=root
    DB_PASSWORD=your_mysql_password
    FRONTEND_URL=http://localhost:5173
    BROADCAST_CONNECTION=reverb
    REVERB_APP_ID=noteapp
    REVERB_APP_KEY=noteapp
    REVERB_APP_SECRET=notesecret
    REVERB_HOST=127.0.0.1
    REVERB_PORT=8080
    REVERB_SCHEME=http

  php artisan migrate --force
  php artisan db:seed --force
  php artisan storage:link

  Start servers (3 terminals):
    Terminal 1: php artisan serve --port=8000
    Terminal 2: php artisan reverb:start --host=0.0.0.0 --port=8080
    Terminal 3: (frontend)

─── FRONTEND SETUP ───────────────────────────────────────────

  cd frontend
  npm install
  cp .env.example .env.local

  Edit .env.local:
    VITE_REVERB_APP_KEY=noteapp
    VITE_REVERB_HOST=localhost
    VITE_REVERB_PORT=8080
    VITE_REVERB_SCHEME=http

  npm run dev

  Open: http://localhost:5173

================================================================
  FEATURES IMPLEMENTED (28/28 criteria)
================================================================

  ACCOUNT MANAGEMENT (2.0 pts)
  1.  User registration (email + display_name + password ×2 only)
  2.  Email account activation (link-based)
  3.  Login / Logout
  4.  Password reset (link OR OTP via email)
  5.  View profile & avatar (display_name, email)
  6.  Edit profile (display_name via preferences)
  7.  Change password (from preferences)
  8.  User preferences (font size, note color, light/dark theme)

  SIMPLE NOTE MANAGEMENT (4.0 pts)
  9.  Display notes in list view
  10. Display notes in grid view (DEFAULT)
  11. Create note (title + content only, no extra fields)
  12. Update note (same UI as create, auto-save, NO save button)
  13. Delete note (confirmation dialog always shown)
  14. Auto-save (500ms debounce, no save button)
  15. Attach images to notes (one or multiple)
  16. Pin notes to top (latest pinned = first)
  17. Live search (300ms debounce, title + content, no search button)
  18. Label management (add / rename / delete — rename auto-updates notes)
  19. Attach labels to notes (multi-label per note)
  20. Filter notes by label

  ADVANCED NOTE MANAGEMENT (2.0 pts)
  21. Enable / disable password lock on note
  22. Password protection: prompt before view/edit/delete
         Change password (requires current pw + new ×2)
  23. Share note via email (read-only or edit permission)
         Owner can revoke / change permission anytime
  24. Real-time collaboration via WebSocket (Laravel Reverb)
         Edit-permission recipients co-edit simultaneously

  OTHER REQUIREMENTS (2.0 pts)
  25. UI/UX — responsive, Bootstrap 5, clean design
  26. Responsive design (mobile, tablet, desktop)
  27. Offline capabilities — PWA + Service Worker + IndexedDB
         Sync queue flushes on reconnect
  28. Docker Compose deployment

  CODING GUIDELINES
  No hardcoded URLs or ports anywhere in frontend code
  All API calls use relative paths (/api/...)
  Nginx reverse-proxy handles routing (no CORS issues)

================================================================
  PROJECT STRUCTURE
================================================================

noteapp/
├── backend/                    Laravel 11
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── AuthController.php
│   │   │   │   └── PasswordResetController.php
│   │   │   ├── NoteController.php
│   │   │   ├── NotePasswordController.php
│   │   │   ├── LabelController.php
│   │   │   ├── ShareController.php
│   │   │   ├── SharedNoteEditController.php
│   │   │   └── UserPreferencesController.php
│   │   ├── Events/
│   │   │   └── NoteUpdated.php       (WebSocket broadcast)
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Note.php
│   │       ├── Label.php
│   │       └── SharedNote.php
│   ├── database/migrations/
│   ├── resources/views/emails/
│   ├── routes/
│   │   ├── api.php
│   │   └── channels.php
│   └── Dockerfile
│
├── frontend/                   React 18 + Vite
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js           (no hardcoded URLs)
│   │   │   ├── noteApi.js
│   │   │   └── shareApi.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── NoteContext.jsx    (offline-aware)
│   │   ├── hooks/
│   │   │   ├── useAutoSave.js     (500ms debounce)
│   │   │   ├── useCollaboration.js (WebSocket)
│   │   │   └── useOnlineStatus.js
│   │   ├── components/
│   │   │   ├── NoteCard.jsx       (GridCard + ListRow + icons)
│   │   │   ├── NoteEditor.jsx     (shared create/edit modal)
│   │   │   ├── NoteUnlockModal.jsx
│   │   │   ├── NoteLockManager.jsx
│   │   │   ├── ShareManager.jsx
│   │   │   ├── SearchBar.jsx      (300ms debounce, no button)
│   │   │   ├── LabelManager.jsx
│   │   │   ├── UnverifiedBanner.jsx
│   │   │   ├── OfflineBanner.jsx
│   │   │   └── DeleteConfirmDialog.jsx
│   │   ├── db/
│   │   │   └── noteDB.js          (IndexedDB via idb)
│   │   ├── utils/
│   │   │   ├── unlockTokenStore.js (in-memory, NOT localStorage)
│   │   │   ├── syncManager.js     (offline → online sync)
│   │   │   └── pwa.js
│   │   └── pages/
│   │       ├── HomePage.jsx
│   │       ├── AuthPages.jsx      (Login + Register)
│   │       ├── PasswordPages.jsx  (ForgotPw + ResetPw + VerifyEmail)
│   │       ├── PreferencesPage.jsx
│   │       └── SharedWithMePage.jsx
│   ├── public/
│   │   ├── sw.js                  (Service Worker)
│   │   └── manifest.json          (PWA manifest)
│   ├── Dockerfile
│   └── nginx.conf                 (reverse-proxy, no hardcoded ports)
│
├── docker-compose.yml
└── readme.txt                     (this file)
