import { site } from "@/config/site";

/** Faint repeating shop name drawn over product photos. */
export const watermarkUrl = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="190" height="190"><text x="95" y="100" font-family="system-ui, sans-serif" font-size="15" font-weight="700" fill="rgb(16 36 29 / 0.09)" text-anchor="middle" transform="rotate(-24 95 95)">${site.name}</text></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();
