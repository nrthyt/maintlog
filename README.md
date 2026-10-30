# MaintLog

A personal maintenance log for cars, boats and outboard motors — service history, parts replacement and next-due reminders.

## Why
Cars are serviced by mileage, boats and outboards by engine hours. Most owners still track this in paper notebooks or spreadsheets. MaintLog keeps both in one place and tells you what is due next.

## Getting started

```sh
npm install
npm run dev     # start the dev server and open the printed URL
npm test        # run the test suite
```

Other scripts: `npm run build` (production build to `dist/`), `npm run lint`.

MaintLog is local-first: all data is stored in your browser's IndexedDB and never leaves your device. There is no server, no account and no sync. On first launch you can load a small set of fictional sample data to explore the app.

## Planned features
- [x] Register vehicles, boats and engines
- [x] Record services, parts replacements and fluid changes
- [ ] Next-due calculation by date, mileage or engine hours
- [ ] Parts and fluid tracking with reusable service templates
- [ ] CSV import / export and backup
- [ ] Tests and documentation

## Status
Early prototype — vehicles and service records can be registered, edited, deleted and listed. Everything else on the roadmap is still to come.

## Tech stack
Vite, React, TypeScript, Dexie.js (IndexedDB), Vitest.

## License
MIT
