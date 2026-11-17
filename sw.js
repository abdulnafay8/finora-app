/* Finora's service worker.
 *
 * 1. Lets the installed app open with no connection: every file of the build
 *    is cached when it installs.
 * 2. Makes the page cross-origin isolated, which the on-device database
 *    (SQLite in WebAssembly) needs, on hosts that cannot send the headers
 *    themselves, such as GitHub Pages. The page reloads once, on the very
 *    first visit, when this worker takes over (see public/index.html).
 *
 * `npm run build:web` copies this into dist/ and fills in BUILD, BASE and
 * FILES. Each build installs as a new version and waits. The app then offers
 * "Update now", which takes over and reloads straight away; otherwise it
 * takes over once every Finora window has been closed. Either way an open
 * window never mixes two builds.
 *
 * Only the app's own files are cached. Financial data never passes through
 * here: it lives in the on-device database, and requests to the cloud go
 * straight to the network.
 */

const BUILD = 'ae9b4f6bc290';
const BASE = '/finora-app';
const FILES = ["/finora-app/_expo/static/css/web-b7bda736f8ab0b8b09b1ef869b8e98fc.css","/finora-app/_expo/static/js/web/+not-found-b9b3e10b0e1d873bccab52cf5049a61c.js","/finora-app/_expo/static/js/web/__common-27ceb16c9d12b2a34f597dbd35dda4f0.js","/finora-app/_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","/finora-app/_expo/static/js/web/_layout-1163ca9bee4d5ab27dcf1b60b5a049c1.js","/finora-app/_expo/static/js/web/_layout-1dc01fd16e5ad9a97fc18301105db752.js","/finora-app/_expo/static/js/web/account-form-f805a92f5e892a1d46c1a7e32408c463.js","/finora-app/_expo/static/js/web/accounts-18738974f2473ea720e35fb8ea798269.js","/finora-app/_expo/static/js/web/add-transaction-5c60cbe31854ec76935b00d666372ef1.js","/finora-app/_expo/static/js/web/budgets-41cc0ebbdcb40fd138fb68a9e966f816.js","/finora-app/_expo/static/js/web/categories-180fa7764509312e64dc212084a0010f.js","/finora-app/_expo/static/js/web/category-form-637e904bc7a6572d6d937872e8bbbe52.js","/finora-app/_expo/static/js/web/entry-32a4e4017532beed102412a30635cc35.js","/finora-app/_expo/static/js/web/index-683504db495e60cc00803fb17fb6ef16.js","/finora-app/_expo/static/js/web/insights-bb617288355e19d021c86eee49e00206.js","/finora-app/_expo/static/js/web/profile-form-2b9436bb290b9f7804fd59b73908a20f.js","/finora-app/_expo/static/js/web/quick-entry-ee8877929a4e227e0ce5531ac7dca7ab.js","/finora-app/_expo/static/js/web/settings-75d4d0265ed710e6650d67645c1e5005.js","/finora-app/_expo/static/js/web/sign-in-f6d838115da33acfc1d840a8fb5fc541.js","/finora-app/_expo/static/js/web/sign-up-efe8bcdf3341e0563c1e3ffae1c39149.js","/finora-app/_expo/static/js/web/sync-conflicts-cd9004674463a1843952ff78e8e3b236.js","/finora-app/_expo/static/js/web/transactions-858c70c43420d4c6950745ab0b04cab0.js","/finora-app/_expo/static/js/web/welcome-1b2906dbcefb3382a17c83b420fc39e4.js","/finora-app/_expo/static/js/web/worker-31565cadb221cc2a4906d417be57cd94.js","/finora-app/assets/node_modules/@expo-google-fonts/instrument-serif/400Regular/InstrumentSerif_400Regular.1e3bf8f4e9f996285924f99ebc80e546.ttf","/finora-app/assets/node_modules/@expo-google-fonts/instrument-serif/400Regular_Italic/InstrumentSerif_400Regular_Italic.4036d1c3db2f215c15e9c022fb4644c8.ttf","/finora-app/assets/node_modules/@expo-google-fonts/lato/100Thin/Lato_100Thin.7ab0bc06eecc1b75f8708aba3d3b044a.ttf","/finora-app/assets/node_modules/@expo-google-fonts/lato/100Thin_Italic/Lato_100Thin_Italic.2b26bc77c3f9432c9d4ca4911520294d.ttf","/finora-app/assets/node_modules/@expo-google-fonts/lato/300Light/Lato_300Light.2bcc211c05fc425a57b2767a4cdcf174.ttf","/finora-app/assets/node_modules/@expo-google-fonts/lato/300Light_Italic/Lato_300Light_Italic.2404a6da847c878edbc8280745365cba.ttf","/finora-app/assets/node_modules/@expo-google-fonts/lato/400Regular/Lato_400Regular.122dd68d69fe9587e062d20d9ff5de2a.ttf","/finora-app/assets/node_modules/@expo-google-fonts/lato/400Regular_Italic/Lato_400Regular_Italic.5d22f337a040ae2857e36e7c5800369b.ttf","/finora-app/assets/node_modules/@expo-google-fonts/lato/700Bold/Lato_700Bold.24b516c266d7341c954cb2918f1c8f38.ttf","/finora-app/assets/node_modules/@expo-google-fonts/lato/700Bold_Italic/Lato_700Bold_Italic.acc03ac1e9162f0388c005177d55d762.ttf","/finora-app/assets/node_modules/@expo-google-fonts/lato/900Black/Lato_900Black.d83ab24f5cf2be8b7a9873dd64f6060a.ttf","/finora-app/assets/node_modules/@expo-google-fonts/lato/900Black_Italic/Lato_900Black_Italic.047217f671c9e0849c97d43e26543046.ttf","/finora-app/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ca4b48e04dc1ce10bfbddb262c8b835f.ttf","/finora-app/assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","/finora-app/assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","/finora-app/assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","/finora-app/assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","/finora-app/assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","/finora-app/assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","/finora-app/assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","/finora-app/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","/finora-app/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","/finora-app/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","/finora-app/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","/finora-app/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","/finora-app/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","/finora-app/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","/finora-app/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","/finora-app/assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","/finora-app/assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","/finora-app/assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","/finora-app/assets/node_modules/expo-sqlite/web/wa-sqlite/wa-sqlite.5e61fe84c4a4f49e0b1a33661b45c791.wasm","/finora-app/icons/apple-touch-icon.png","/finora-app/icons/favicon-48.png","/finora-app/icons/icon-192.png","/finora-app/icons/icon-512.png","/finora-app/icons/maskable-512.png","/finora-app/index.html","/finora-app/manifest.webmanifest"];
const CACHE = `finora-${BUILD}`;

// The page asks for this when the user taps "Update now".
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // `reload` skips the browser's HTTP cache, so the files match this build.
      cache.addAll(FILES.map((path) => new Request(path, { cache: 'reload' }))),
    ),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) => name.startsWith('finora-') && name !== CACHE && name !== 'finora-shared',
          )
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

/** The headers that make the page cross-origin isolated, added to our own responses. */
function isolated(response) {
  // Opaque and error responses cannot be rebuilt; pass them on unchanged.
  if (!response || response.status === 0 || response.type === 'opaqueredirect') return response;
  const headers = new Headers(response.headers);
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Text shared to Finora from another app (Android's share sheet). It is kept
 * in a cache for the app to read once, then quick add opens with it. The text
 * never goes into a web address and never leaves the device.
 */
async function receiveShare(request) {
  try {
    const form = await request.formData();
    const text = [form.get('title'), form.get('text')]
      .filter((part) => typeof part === 'string' && part.trim())
      .join('\n')
      .slice(0, 1000);
    const cache = await caches.open('finora-shared');
    await cache.put(`${BASE}/__shared__`, new Response(text));
  } catch {
    // Nothing usable was shared; quick add simply opens empty.
  }
  return Response.redirect(`${BASE}/quick-entry?shared=1`, 303);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (
    request.method === 'POST' &&
    url.origin === self.location.origin &&
    url.pathname === `${BASE}/share`
  ) {
    event.respondWith(receiveShare(request));
    return;
  }
  if (request.method !== 'GET') return;
  // Other origins (the cloud) are never cached or changed.
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Every route is the same single page.
    event.respondWith(
      caches
        .open(CACHE)
        .then((cache) => cache.match(`${BASE}/index.html`))
        .then((cached) => cached ?? fetch(request))
        .then(isolated),
    );
    return;
  }

  event.respondWith(
    caches
      .open(CACHE)
      .then((cache) => cache.match(request, { ignoreSearch: true }))
      .then((cached) => cached ?? fetch(request))
      .then(isolated),
  );
});
