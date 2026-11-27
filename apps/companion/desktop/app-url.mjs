export const APP_URL='peos://app/index.html';
// A fragment identifies a location in the SAME document. Nothing before it may vary.
// Do not compare only origin or use a general prefix: those admit other paths or queries.
export const isAppDocument=url=>typeof url==='string'&&(url===APP_URL||url.startsWith(`${APP_URL}#`));
