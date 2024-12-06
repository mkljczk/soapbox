interface UnicodeMap {
  [s: string]: {
    unified: string;
    shortcode: string;
  };
}

export default import.meta.compileTime<UnicodeMap>('./mapping-compiletime.ts');

export type { UnicodeMap };
