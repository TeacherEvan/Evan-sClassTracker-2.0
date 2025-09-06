# EvansClassTracker 2.0 - Complete Blueprint

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Backend**: Convex (Real-time database & functions)
- **Styling**: Tailwind CSS + Framer Motion (animations)
- **UI Components**: Shadcn/ui (customized with Midas-Stoic theme)
- **Calendar**: React Big Calendar or FullCalendar
- **Authentication**: Convex Auth with bcrypt for password hashing
- **Internationalization**: next-intl (EN/TH support)

## Theme: Midas-Stoic
- **Primary Colors**: Gold (#FFD700), Deep Navy (#1a1f36), Marble White (#FAFAFA)
- **Accent Colors**: Bronze (#CD7F32), Silver (#C0C0C0)
- **Typography**: Playfair Display (headers), Inter (body)
- **Subtle animations**: Gold shimmer effects, smooth transitions
- **Icons**: Lucide React with custom gold accents

## Project Structure
```
evans-class-tracker/
├── app/
│   ├── [locale]/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── admin/
│   │   │   ├── moderator/
│   │   │   ├── teacher/
│   │   │   └── layout.tsx
│   │   └── layout.tsx
├── convex/
│   ├── schema.ts
│   ├── auth.ts
│   ├── users.ts
│   ├── classes.ts
│   ├── students.ts
│   ├── messages.ts
│   └── credits.ts
├── components/
│   ├── calendar/
│   ├── dashboard/
│   ├── messaging/
│   ├── ui/
│   └── theme/
├── lib/
│   ├── i18n/
│   ├── utils/
│   └── constants/
└── public/
```