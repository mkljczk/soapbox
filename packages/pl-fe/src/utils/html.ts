/** Convert HTML to a plaintext representation, preserving whitespace. */
// NB: This function can still return unsafe HTML
const unescapeHTML = (html: string = ''): string => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.replace(/<br\s*\/?>/g, '\n').replace(/<\/p><[^>]*>/g, '\n\n').replace(/<[^>]*>/g, '');
  return wrapper.textContent || '';
};

/** Convert HTML to plaintext. */
// https://stackoverflow.com/a/822486
const stripHTML = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

export {
  unescapeHTML,
  stripHTML,
};
