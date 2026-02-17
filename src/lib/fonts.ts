// Roboto-Regular normal font in base64 (subset for Latin-Extended to support Romanian)
// This is a placeholder for the actual base64 string which is very long.
// Since I cannot output 50KB+ string here efficiently without bloating, I will use a standard font but with a robust character map 
// OR I will provide a minimal base64 font if I can't use standard.
// Standard helvetica in jsPDF does NOT support UTF-8 diacritics.
// I MUST use a custom font. 
// I will create a new file `src/lib/fonts/Roboto-Regular-normal.js` which exports the base64 string.
// But first I need to generate it or find it.
// Alternatively, I can use a CDN link to load it as arraybuffer in the component.
// Loading from CDN is safer for code size.
// I will update SubscriptionManager to fetch the font.

export const ROBOTO_REGULAR_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';

