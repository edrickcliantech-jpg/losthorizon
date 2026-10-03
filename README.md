# losthorizon

Custom admin UI code for the Lost Horizon WordPress site.

## What is in this repository

This repo tracks **only hand-written code**. WordPress core is a large, frequently
updated dependency and is intentionally not committed here.

```
.gitignore
wp-content/plugins/admin-sidebar-customizer/
├── admin-sidebar-customizer.php     # plugin bootstrap (enqueue assets, localize config)
├── assets/css/admin-sidebar.css     # admin theme: glassmorphism sidebar, light/dark themes
├── assets/js/admin-sidebar.js       # sidebar expand/collapse, click submenus, mobile panel
└── todo.txt                         # changelog / notes
```

## Not tracked (by design)

Excluded via `.gitignore`:

- WordPress core (`wp-admin/`, `wp-includes/`, `wp-*.php`)
- Bundled default themes (`twentytwentythree`, `twentytwentyfour`, `twentytwentyfive`)
- Other plugins (`akismet`, `hello.php`)
- `wp-content/uploads/`
- `wp-config.php` and `.htaccess` — environment-specific, contains DB credentials and salts

**Cloning this repo does not give you a working WordPress site.** It only contains the
custom plugin. Drop the plugin folder into an existing WordPress install to use it.

## Usage

Enable the plugin under **Plugins** in wp-admin. It then restyles the whole admin:
floating collapsible sidebar, click-to-open submenus, a mobile navigation panel, and a
light/dark theme toggle (persisted in `localStorage`).