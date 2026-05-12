# Recommended design tokens

These are recommendations based on the supplied visuals. Adjust only if existing brand assets require it.

## Color

```css
:root {
  --bg: #f3f3f1;
  --surface: #f7f7f5;
  --text: #111111;
  --text-muted: #5f5f5a;
  --line: rgba(17, 17, 17, 0.10);
}
```

The exact background can lean slightly warmer or cooler depending on the imagery, but keep it very restrained.

## Spacing

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;
  --space-10: 128px;
}
```

## Layout

```css
:root {
  --page-pad-desktop: 40px;
  --page-pad-wide: 56px;
  --page-pad-tablet: 24px;
  --page-pad-mobile: 16px;

  --nav-height: 72px;
  --sidebar-width-desktop: 220px;
  --content-max: 1600px;
}
```

## Typography

Recommended starting point, tune to brand assets:

```css
:root {
  --font-ui: "Inter", "Helvetica Neue", Arial, sans-serif;
  --font-editorial: "Iowan Old Style", "Times New Roman", serif;

  --text-nav: 14px;
  --text-body: 14px;
  --text-meta: 12px;
  --text-title-sm: 16px;
  --text-title-md: 22px;
  --text-brand: 24px;

  --leading-tight: 1.1;
  --leading-normal: 1.35;
  --leading-loose: 1.5;

  --tracking-tight: -0.02em;
  --tracking-normal: 0em;
  --tracking-wide: 0.04em;
}
```

## Motion

```css
:root {
  --ease-soft: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-fast: 180ms;
  --dur-med: 320ms;
  --dur-slow: 520ms;
}
```

## Image rules

- no radius
- no shadow
- object fit must be deliberate
- preserve portrait dominance where imagery demands it
- do not force all cards into the same feeling if different crops are more editorial
