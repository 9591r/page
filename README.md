# Social Signal 09

A static, dark-mode social landing page designed for GitHub Pages. It uses
full-screen scroll snapping, responsive layouts, a glitch hero, and a Three.js
neon scene that changes with each social channel.

## Update the placeholder links

Open index.html and replace these five values:

- https://github.com/9591r
- https://facebook.com/ruben.9591
- https://instagram.com/9591r
- https://youtube.com/@9592r
- https://twitch.tv/9592r

The summaries and channel labels are in the same social sections.

## Preview locally

You can open `index.html` directly or serve this folder with any static HTTP
server. The browser-ready Three.js scene is bundled locally.

## Publish on GitHub Pages

Upload the contents of this folder to a repository, then enable GitHub Pages
for the branch containing index.html. No build command is required.

Three.js, the reference font, and the scene modules are packaged in
`js/main.bundle.js`, so the page does not need a CDN at runtime. The source
social SVG paths and neon 9 treatment remain in `js/three-scene.js`.
