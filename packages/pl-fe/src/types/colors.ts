type Rgb = { r: number; g: number; b: number };
type Hsl = { h: number; s: number; l: number };

type TailwindColorObject = {
  [key: number]: string;
};

type TailwindColorPalette = {
  [key: string]: TailwindColorObject | string | null;
}

export type { Rgb, Hsl, TailwindColorObject, TailwindColorPalette };
