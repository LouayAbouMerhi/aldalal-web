/**
 * Store details shown across the site. Edit these to change contact info.
 * `whatsapp` is the number orders are sent to (international format, digits only).
 */
export const site = {
  name: "ALDALAL",
  fullName: "ALDALAL For General Trading",
  description:
    "Browse the ALDALAL For General Trading price list: shampoo, deodorant, body wash, toothpaste and more, with photos and prices in USD.",
  address: "Sibline, Al Chouf Main Road, Lebanon",
  phones: [
    { display: "70 695 225", tel: "+96170695225" },
    { display: "81 006 515", tel: "+96181006515" },
  ],
  whatsapp: "96170695225",
  currency: "USD",
  /**
   * Protects the product photos: no right-click menu, no dragging, no long-press
   * save on phones, a faint watermark, and blocked save/devtools shortcuts.
   * Set to false to turn all of that off.
   */
  protectPhotos: true,
} as const;

export const whatsappDisplay = site.phones.find((p) => p.tel.replace(/\D/g, "") === site.whatsapp)?.display ?? site.whatsapp;
