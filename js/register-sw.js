"use strict";
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* The portfolio also works without offline caching. */
    });
  });
}
