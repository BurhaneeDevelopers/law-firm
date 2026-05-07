# Remaining Pages to Update for Dark Mode

## Pages That Need Updates

The following pages still use hardcoded colors and need to be updated with theme-aware classes:

### High Priority (User-Facing Pages)
1. `app/(app)/cases/page.tsx` - Cases list page
2. `app/(app)/cases/[id]/page.tsx` - Case details page
3. `app/(app)/cases/new/page.tsx` - New case form
4. `app/(app)/clients/page.tsx` - Clients list page
5. `app/(app)/clients/[id]/page.tsx` - Client details page
6. `app/(app)/clients/new/page.tsx` - New client form
7. `app/(app)/calendar/page.tsx` - Calendar view
8. `app/(app)/documents/page.tsx` - Documents page
9. `app/(app)/notices/page.tsx` - Notices list
10. `app/(app)/notices/[id]/page.tsx` - Notice details
11. `app/(app)/notices/new/page.tsx` - New notice form
12. `app/(app)/ai-assistant/page.tsx` - AI assistant chat
13. `app/(app)/citation-check/page.tsx` - Citation checker
14. `app/(app)/settings/page.tsx` - Settings page

### Medium Priority (Components)
1. `components/layout/sidebar.tsx` - Already has some dark mode classes, verify completeness
2. `components/layout/header.tsx` - Already has some dark mode classes, verify completeness
3. `components/layout/command-palette.tsx` - Needs review
4. `components/layout/watermark.tsx` - Needs review
5. `components/ui/badge.tsx` - UI component
6. `components/ui/confirm-dialog.tsx` - UI component
7. `components/ui/skeleton.tsx` - UI component
8. `components/ui/toast.tsx` - UI component

### Citation Check Components
1. `app/(app)/citation-check/components/citation-results.tsx`
2. `app/(app)/citation-check/components/history-drawer.tsx`
3. `app/(app)/citation-check/components/info-cards.tsx`
4. `app/(app)/citation-check/components/risk-gauge.tsx`

## Quick Reference: Common Replacements

### Backgrounds
```tsx
// Replace these:
bg-white → bg-card
bg-slate-50 → bg-muted
bg-slate-100 → bg-muted
bg-gray-50 → bg-muted

// Keep these (they're fine):
bg-indigo-700, bg-amber-500, etc. (colored buttons)
```

### Text Colors
```tsx
// Replace these:
text-slate-900 → text-foreground
text-slate-800 → text-foreground
text-slate-700 → text-foreground
text-slate-600 → text-muted-foreground
text-slate-500 → text-muted-foreground
text-slate-400 → text-muted-foreground
```

### Borders
```tsx
// Replace these:
border-slate-100 → border-border
border-slate-200 → border-border
border-slate-300 → border-border
```

### Hover States
```tsx
// Replace these:
hover:bg-slate-50 → hover:bg-muted
hover:bg-slate-100 → hover:bg-muted
hover:bg-white → hover:bg-card
```

### Colored Elements (Need Dark Variants)
```tsx
// Add dark: variants to these:
bg-indigo-50 → bg-indigo-50 dark:bg-indigo-950
text-indigo-600 → text-indigo-600 dark:text-indigo-400
text-indigo-700 → text-indigo-700 dark:text-indigo-300
border-indigo-200 → border-indigo-200 dark:border-indigo-800

// Same pattern for other colors:
- amber: 50→950, 600→400, 700→300, 200→800
- rose: 50→950, 600→400, 700→300, 200→800
- emerald: 50→950, 600→400, 700→300, 200→800
- purple: 50→950, 600→400, 700→300, 200→800
```

## Automated Search & Replace Strategy

You can use these regex patterns to help with bulk updates:

### Pattern 1: Simple Background
```regex
Find: bg-white(?!\s*dark:)
Replace: bg-card
```

### Pattern 2: Slate Text
```regex
Find: text-slate-(900|800|700)(?!\s*dark:)
Replace: text-foreground
```

### Pattern 3: Muted Text
```regex
Find: text-slate-(600|500|400)(?!\s*dark:)
Replace: text-muted-foreground
```

### Pattern 4: Borders
```regex
Find: border-slate-(100|200|300)(?!\s*dark:)
Replace: border-border
```

## Testing Each Page

After updating each page, test:

1. ✅ Toggle theme - all text visible
2. ✅ All backgrounds have proper contrast
3. ✅ Borders are visible
4. ✅ Hover states work
5. ✅ Icons have proper colors
6. ✅ Forms are readable
7. ✅ Buttons have proper contrast
8. ✅ Status badges are readable
9. ✅ Tables are readable
10. ✅ Modals/dialogs work in both themes

## Priority Order

1. **Start with most-used pages**: Dashboard (✅ Done), Cases, Clients
2. **Then forms**: New case, New client, New notice
3. **Then detail pages**: Case details, Client details
4. **Then utility pages**: Calendar, Documents, Settings
5. **Finally components**: UI components, Citation check components

## Notes

- The dashboard page (`app/(app)/dashboard/page.tsx`) is now fully updated and can serve as a reference
- All utility functions in `lib/utils.ts` now support dark mode
- The theme system in `lib/theme.tsx` is working correctly
- CSS variables in `app/globals.css` are comprehensive
- Tailwind config is properly set up

## Estimated Time

- Each page: 10-15 minutes
- Each component: 5-10 minutes
- Total: ~3-4 hours for complete migration

## Verification Script

After updating all pages, run this checklist:

```bash
# Search for remaining hardcoded colors
grep -r "bg-white" app/ --include="*.tsx" --include="*.ts"
grep -r "text-slate-9" app/ --include="*.tsx" --include="*.ts"
grep -r "border-slate-1" app/ --include="*.tsx" --include="*.ts"
```

Any results should be reviewed to ensure they're intentional or have dark mode variants.
