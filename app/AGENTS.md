# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

Pinned to SDK 54, matching the Expo Go client actually installed on the
household's phone — **ask the user which SDK their installed Expo Go app
reports before changing this**, don't infer it from npm dist-tags or how
recently a version was published. Expo Go only supports a narrow, moving
window of SDKs and reliably reports its own version + "requires a
newer/older Expo Go" in its error screen; that's ground truth, guessing
from the registry isn't (SDK 57 lacking an `sdk-57` npm dist-tag looked like
a sign it was unreleased/unsupported — it wasn't a reliable signal either
way).

To re-pin every Expo-managed package to a given SDK N: `npm pack expo@N`,
untar it, and read `bundledNativeModules.json` — it's the exact version
map Expo's own CLI uses. Packages not listed there (this project:
`@supabase/supabase-js`, `@react-navigation/*`, `lucide-react-native`,
`react-native-url-polyfill`, the `@expo-google-fonts/*` packages) aren't
SDK-pinned and don't need touching.
