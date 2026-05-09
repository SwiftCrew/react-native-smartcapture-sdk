# Smart Capture — Example App

This is a fully-working React Native sample app that consumes
`react-native-smart-capture` from `../src` (linked via `module-resolver`
+ Metro `watchFolders`).

It demonstrates the **recommended permission-first flow**:

1. User taps **Upload Profile Picture**.
2. `ensureAllPermissions()` is called and the result is rendered in a
   status panel — no auto-launch on denial.
3. If granted, `openProfileImagePicker(...)` is called.
4. Selected image is rendered in a circular avatar; "Remove Profile
   Picture" reverts to initials.

## Running

```bash
# from the repo root
yarn install
yarn example pods             # iOS only
yarn example:ios              # or
yarn example:android
```

## Key files

| File | Purpose |
| --- | --- |
| `App.tsx` | Demonstrates the public API end-to-end. |
| `babel.config.js` | Aliases the package name → `../src` for live reload. |
| `metro.config.js` | Adds `..` to watch folders & blocks duplicate peers. |
| `ios/.../Info.plist` | Minimum required iOS permission strings. |
| `android/.../AndroidManifest.xml` | Minimum required Android permissions. |

> **Note:** This folder ships only the JS layer plus the few native
> config files that change between projects. Run `npx react-native init`
> once and merge these files in if you want a fully buildable scaffold,
> or follow the iOS / Android setup section in the root README.
