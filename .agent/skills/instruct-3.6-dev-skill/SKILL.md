---
name: instruct-3.6-dev-skill
description: software and UI engineering standards for instruct-3.6 (architecture, layout, navigation, and diagramming).
---

# instruct-3.6-dev-skill: software & UI engineering standards
instruct_version: "3.6"

## kernel inheritance
- inherits all rules from `instruct-3.6` (`Step 0` priority & conflict interception, `Step 1` intake & source lock, `Step 3` baby-step unwinding & variable reuse, `Step 4` lowercase single-meaning comments, `Step 5` multi-version traces, and `Step 6` snippet-only milestones & `<patch-n>` partial edits).
- reads `my-knowledge.md` strictly for project-specific requirements, professor/client constraints, and session pickup state.

## 1. architecture, modularity & configuration
- top-of-file constants & settings:
  * place all adjustable settings, magic numbers, limits, and fixed configuration values at the very top of a code file so they can be tuned without searching inside functions.
  * reuse existing `:root` CSS tokens and bounded delay constants instead of hardcoding pixel distances or fixed animation timers.
- single-responsibility files & role naming:
  * separate database-driven code into single-responsibility JS files (core key/blacklist map, live schema reader, query bridge, routes, and UI bridge) instead of mixing them in one file.
  * name JS files with clear role suffixes (`_page`, `_controller`, `_bridge`, `_database`, `_schema`, `_app`) so each file's single job is obvious from its filename.
- standalone optional & experimental modules:
  * keep optional or experimental features isolated in standalone files with safe guards so removing them leaves the core application running cleanly without editing core files.
  * keep runtime UI component files inside the app public folder even when a UI skill is loaded, and only remove unused demo files after confirming.
  * preserve `localStorage` storage, offline seed hooks, relative HTML links, and service worker precache lists when syncing updates to an offline edition, and bump `CACHE_NAME` in `sw.js` whenever cached assets change.
- single source of truth & helper reuse:
  * reuse existing shared helpers instead of writing parallel one-off versions for minor visual or behavioral tweaks.
  * design new helpers to be general and reusable across all containers rather than tying them to one location.
  * keep special fixes scoped strictly to the exact item type that needs them instead of mutating a shared base rule.
- clean setups & sample data:
  * start fresh setups empty and offer an optional load-samples action instead of pre-filling sample entries automatically.
  * remove dormant offline or `localStorage` sample-data hooks from database-backed apps when a separate offline edition exists.
  * keep sample test sets compact while covering every role, boundary limit, and empty state instead of generating hundreds of redundant rows.
  * start dev autofill IDs and sample pools from randomized high-range numbers instead of low fixed seeds so repeated form fills do not collide with saved rows.
- plain-language user validation:
  * write UI error and validation messages in plain everyday words instead of technical jargon (unless an assignment rubric requires exact error strings).
- direct system migrations without legacy shims:
  * when upgrading to a new token, class, or component system, migrate styles, runtime components, and auxiliary modules (such as wave stylesheets, responsive overrides, and dev helpers) directly to the new contract instead of preserving backwards-compatibility aliases or mixing old and new patterns.
  * keep valuable existing UX modules (such as celebration waves, card stacks, and empty states), rewriting their internals cleanly onto the new tokens and DOM patterns.
  * create `.bak` backups before large structural rewrites of shared runtime components or base stylesheets, and ensure `.gitignore` excludes `*.bak` (plus OS junk like `.DS_Store` and `Thumbs.db`) before committing to git.

## 2. UI layout, styling & component consistency
- ask layout before coding:
  * ask the user for structural and spacing choices before writing any layout, instead of guessing a design.
- prototype simplicity:
  * keep early prototypes simple and wait until the user asks before adding extra semantic tags or accessibility labels.
- self-contained & wrapper-safe components:
  * keep a component's own look and spacing rules self-contained on that part instead of depending on outer context when it may be copied or moved alone.
  * check what outer wrapper box a shared helper returns before wrapping it inside another group helper so boxes do not stack inside each other.
  * keep dividers, spacing, and text sizing consistent across similar items instead of making one-off overrides.
- dynamic-text container balance:
  * account for variable-length output inside fixed-position containers so longer dynamic text stays balanced instead of shifting off-center.
- micro-interactions & transitions:
  * include interactive states (hover, focus, active, disabled) and smooth transitions on clickable or moving parts.
  * reserve heavy celebratory transitions for major setup or creation moments instead of overusing them on routine navigation.
  * hide animated elements before a canvas or WebGL snapshot and trigger their CSS entrance inside `onFinish` so timers do not expire behind the transition.
  * strip active navigation animation classes from cloned `#app` snapshots before placing them in `document.body` so old slide animations do not replay during a transition.
  * tighten shader bounding checks, reuse existing tap filters, and drive particle drift with one continuous time value across the wave and post-wave tail so animations stay light and never stall or jump.
- exact summary fidelity:
  * match the exact fields shown on existing summaries and skip extra headers or corner labels the user did not ask for.
  * structure OOBE, Auth, `trSuccessWave`, and `trSheet` directly into 4 dedicated parts without redundant `trSection` wrappers: (1) optional display icon (`as-display as-centered`), (2) `space-t` heading area grouping `trBrandLogo` and text tags, (3) `space-l` content, and (4) `space-l` action buttons.
- preset-only assembly & strict class-set lock:
  * IF building or editing any screen, component, or markup in an existing app:
    THEN treat existing shared UI kit files (`components.js`, `style.css`) as frozen, read-only presets.
    THEN build screens strictly by calling and connecting existing component factories and the stylesheet's closed class set — never edit kit files, never rebuild a preset manually, and never invent ad-hoc CSS classes, wrapper classes, or inline `style="..."` layout hacks.
  * IF a screen seems to need a new component, class, custom grid/flex rule, or structural pattern outside the app's existing presets:
    THEN halt immediately instead of inventing one, and ask whether to fit it into the existing presets or extend the kit with a custom layout.
  * IF the user explicitly asks to modify the kit or build a custom layout / component subtype (e.g., `.card.brandcard`, `.card.profile`):
    THEN allow the requested change and scope it strictly to that variant without mutating shared base utilities.
- component intent & screen hierarchy principles:
  * tabs are strictly for switching page views or panels — NEVER use tabs as option selectors inside forms or sheets (use radio/check rows or selects instead).
  * brand wordmarks are strictly for the brand name — NEVER use brand text or its subtext as decorative styling for counts, stats, or headings.
  * cards hold content, forms, or selectable rows — NEVER place primary/action buttons inside a `.card`; place action buttons outside the card as sibling controls in the section or sheet footer.
  * split task screens into 3 distinct sections (header, content, bottom/actions) mirroring bottom-sheet/stage structure instead of packing everything into one section.
  * keep rows inside a `.card` or list card flat (separated by spacers or clean grid gaps) — NEVER give inner rows card-like backgrounds or borders that look like nested cards (cards may sit inside bottom sheets, not inside other cards).
  * keep app-specific visual extras (such as code blocks, success colors, or custom grids) in a separate standalone stylesheet (`css/<app>-ext.css`) instead of editing frozen shared kit files.
  * style app-generated UI indicators (such as keyboard shortcut numbers) as muted theme elements separate from content text unless the prefix came directly from the source data.
  * render inline markdown (backtick code, bold, italic) using safe DOM nodes (`<code>`, `<strong>`, `<em>`, text nodes) instead of raw `innerHTML` when displaying formatted content.
- utility-first composition & variant-only classes:
  * keep vertical offsets on typography composable (`mb-s`, `mb-m`, `mb-l`) instead of hardcoding `margin-bottom` onto font-size classes so titles inside cards or compact headers are not displaced.
  * use push utilities (`push-right`) on the flexible item in horizontal rows when pushing trailing controls to the edge rather than defaulting to `flex1`.
- zero-specificity base vs. explicit component variants:
  * place base element resets and structural containers inside `:where(...)` (`:where(button)`, `:where(i.icon)`, `:where(.card)`, `:where([role="button"])`) so utility overrides always win cleanly, while keeping styled variant classes (`button.as-standard`, `button.as-primary`, `button.as-tabbed`) unwrapped.
  * avoid locking modifier-sensitive properties like `color` inside base variant classes when sibling utilities (such as `.as-critical`) need to override them.
- real interactive elements & uniform icon sizing:
  * wrap clickable icons in real `<button type="button">` elements styled uniformly for `1:1` proportions instead of attaching clickables to `<i>` tags; size base icons in `em` units so display and inline scales stay consistent.
- guided navigation & card groups:
  * keep navigation headlines abstract and task-oriented (`Manage members`, `Manage unit`, `Member details`, `Edit profile`), and place entity-specific names, IDs, or scopes in the tertiary navigation subtitle only on screens acting on a specific record rather than generic list views.
  * wrap form, detail, and settings cards in grouped containers with concise headlines and explanatory footnotes that guide the user on every screen.
- root component marker classes & spacing hierarchy:
  * place a zero-CSS component identifier class first on every factory root element (`trCard`, `trSection`, `trEmptyState`) before atomic classes so DOM trees remain readable in DevTools.
  * keep `componentsNext.html` (divided by `<!-- trComponent( ), [params, ?optional], used only for ..., do not use for ... -->`) and optional 1:1 `static/*.html` page mirrors using the exact same `tr*` + atomic class strings as `components.js` (with minimal inline JS only for interactive widgets like `trTabbed`, `trMenu`, `trCardStack`, and `trSheet`) so class updates can be previewed statically and synced via Find & Replace.
  * follow consistent nesting spacing: page `<main>` at `space-xl`, `<section>` (`trSection`) at `space-l`, dense inner containers (`trCard`, `trCardGroup`, popup groups, stat cells, `trEmptyState`) at `space-m`, and compact multi-line rows (`trListItem`, `trActionRow`, `trCheckRow`) at `space-s` (`as-primary` + `as-secondary as-gray`), reserving `as-tertiary` for card headlines, footnotes, empty-state subtitles, and field labels.
- navbar clarity & soft edge transition:
  * prefer a soft bottom linear-gradient fade (`::after`) over a hard `border-bottom` under sticky navigation bars and stack navbar titles with `space-s`.
- mobile viewport lock & high-DPI DOM snapshots:
  * lock `html`/`body` as a fixed non-scrolling shell with `.navigation-bar` (`position: sticky; top: 0`) and isolated `.content` scrolling (`flex: 1 1 0; overscroll-behavior-y: contain`) so mobile scroll never hides or stretches the header.
  * when serializing DOM into SVG `<foreignObject>` for WebGL or canvas transitions, wrap clones in `<html xmlns="http://www.w3.org/1999/xhtml">` (copying `document.documentElement` attributes such as `data-font`) around `<body>` with explicit computed `lineHeight`, `window.matchMedia`-filtered stylesheets, and scaled `viewBox` dimensions (`devicePixelRatio`-capped) to eliminate blur, font swaps, and metric drift; omit CSS `opacity` fade transitions on the WebGL overlay canvas so DOM-to-WebGL and WebGL-to-DOM handoffs cut cleanly without ghosting.

## 3. app flows, navigation & access boundaries
- separate creation and editing flows:
  * keep creation and editing flows separate instead of mixing them into one ambiguous state.
- single canonical path:
  * avoid building two competing paths for the same action; redirect to the existing destination instead.
  * skip extra greeting or confirmation screens on routine repeat actions and go straight to the main destination.
- state-aware UI & back-history sync:
  * hide or lock choices that do not apply to the current user role or state instead of showing irrelevant options.
  * keep internal step-back history synced with the device or browser `popstate` back action, dismissing open sheets or modals first before stepping back and recovering cleanly on mismatched history epochs.
- access isolation & safe lookups:
  * avoid adding shortcuts from everyday entry points to higher-access areas when users are expected to switch through a separate path.
  * verify that locking down a shared lookup does not break normal user actions, and expose only the minimal safe details required.

## 4. documentation & system diagramming
- immediate usage notes:
  * write clear, concise usage notes alongside new shared building blocks right away instead of waiting to be reminded.
- focused system maps:
  * split multi-part system maps into separate focused diagrams for each path plus one combined overview instead of merging everything into one chart.
- dangling parameter annotations:
  * document helper and factory parameters with a dangling `// params:` comment directly above the signature, marking each parameter and option property as `(required)` or `(optional)`.
