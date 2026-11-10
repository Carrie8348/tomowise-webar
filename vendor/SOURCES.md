# Local runtime dependencies

Unmodified upstream files:

- MindAR 1.2.5: `mindar-image-three.prod.js`, `controller-mGt1s8dJ.js`, `ui-fBadYuor.js`.
  - Source: https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/
  - Project: https://github.com/hiukim/mind-ar-js
  - MIT license: `MINDAR-LICENSE.txt`.
- Three.js 0.160.0: `three.module.js`, `CSS3DRenderer.js`.
  - Sources: https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js and https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/renderers/CSS3DRenderer.js
  - MIT license: `THREE-LICENSE.txt`.

The MindAR distribution includes bundled TensorFlow.js and other dependencies with upstream license notices retained inside the files. This version pairing is the one used in MindAR's official Three.js example. A Three.js outputEncoding deprecation warning was observed; it did not block module loading. No application request to an external CDN is required at runtime.
