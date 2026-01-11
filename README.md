# Comedy Preview Widget

An embeddable "baseball card" widget for comedy club websites. Comedians create profiles with video samples; clubs embed the widget to preview comedians and drive ticket sales.

## Quick Start

### 1. Start Docker
Make sure Docker Desktop is running.

### 2. Start Supabase
```bash
npx supabase init  # Only first time
npx supabase start
```

This will output your local Supabase credentials. The `.env.local` file is pre-configured with default local values.

### 3. Run Migrations
```bash
npx supabase db push
```

### 4. Start Development Server
```bash
npm run dev
```

Open http://localhost:5173

## Usage

### For Comedians
1. Go to http://localhost:5173/login
2. Sign up as a comedian
3. Create your profile with name, bio, photo URL, and YouTube video URL
4. Your "baseball card" is now available for clubs to add

### For Clubs
1. Go to http://localhost:5173/login
2. Sign up as a club
3. Enter your club name
4. Add comedians from the available list
5. Enter ticket URLs for each comedian
6. Copy the embed code for your website

## Widget Embedding

Add this to any website:

```html
<div id="comedy-widget"></div>
<script src="https://your-cdn.com/comedy-widget.iife.js"></script>
<script>
  ComedyWidget.init({
    widgetKey: 'YOUR_WIDGET_KEY',
    container: '#comedy-widget',
    theme: 'dark',      // or 'light'
    columns: 3          // 1-4
  });
</script>
```

## Building

```bash
# Build main app
npm run build

# Build widget library
npm run build:widget
```

Widget outputs:
- `dist/widget/comedy-widget.iife.js` - For `<script>` tag
- `dist/widget/comedy-widget.es.js` - For npm/bundlers

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ComedianCard.tsx  # The "baseball card"
│   └── VideoPlayer.tsx   # YouTube embed
├── pages/
│   ├── comedian/     # Comedian dashboard
│   └── club/         # Club dashboard
├── hooks/            # React hooks (auth)
└── lib/              # Utilities (supabase, types)

widget/               # Embeddable widget (separate build)
├── index.tsx         # Entry point
├── ComedyWidget.tsx  # Main widget component
└── styles.css        # Scoped CSS

supabase/
└── migrations/       # Database schema
```

## Tech Stack

- React + TypeScript + Vite
- Supabase (auth, database)
- YouTube embeds for video
- CSS Modules for styling
