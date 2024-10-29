/** @type {Partial<import('typedoc').TypeDocOptions>} */

const config = {
  entryPoints: ['./lib/main.ts'],
  plugin: ['typedoc-material-theme', 'typedoc-plugin-valibot'],
  themeColor: '#d80482',
};

export default config;
