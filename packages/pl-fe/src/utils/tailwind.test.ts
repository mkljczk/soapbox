import { Map as ImmutableMap } from 'immutable';

import { toTailwind, fromBasicColors, expandPalette } from './tailwind';

describe('toTailwind()', () => {
  it('handles empty pl-fe config', () => {
    const plFeConfig = ImmutableMap<string, any>();
    const result = toTailwind(plFeConfig);
    const expected = ImmutableMap({ colors: ImmutableMap() });
    expect(result).toEqual(expected);
  });

  it('converts brandColor into a Tailwind color palette', () => {
    const plFeConfig = ImmutableMap({ brandColor: '#0482d8' });

    const expected = {
      brandColor: '#0482d8',
      colors: {
        primary: {
          50: '#f2f9fd',
          100: '#e6f3fb',
          200: '#c0e0f5',
          300: '#4fa8e4',
          400: '#369be0',
          500: '#0482d8',
          600: '#0475c2',
          700: '#0362a2',
          800: '#012741',
          900: '#011929',
        },
      },
    };

    const result = toTailwind(plFeConfig);
    expect(result.toJS()).toMatchObject(expected);
  });

  it('prefers Tailwind colors object over legacy colors', () => {
    const plFeConfig = ImmutableMap({
      brandColor: '#0482d8',
      colors: ImmutableMap({
        primary: ImmutableMap({
          300: '#ff0000',
        }),
      }),
    });

    const expected = {
      brandColor: '#0482d8',
      colors: {
        primary: {
          50: '#f2f9fd',
          100: '#e6f3fb',
          200: '#c0e0f5',
          300: '#ff0000', // <--
          400: '#369be0',
          500: '#0482d8',
          600: '#0475c2',
          700: '#0362a2',
          800: '#012741',
          900: '#011929',
        },
      },
    };

    const result = toTailwind(plFeConfig);
    expect(result.toJS()).toMatchObject(expected);
  });
});

describe('fromBasicColors()', () => {
  it('converts only brandColor', () => {
    const plFeConfig = ImmutableMap({ brandColor: '#0482d8' });

    const expected = {
      primary: {
        50: '#f2f9fd',
        100: '#e6f3fb',
        200: '#c0e0f5',
        300: '#4fa8e4',
        400: '#369be0',
        500: '#0482d8',
        600: '#0475c2',
        700: '#0362a2',
        800: '#012741',
        900: '#011929',
      },
      // Accent color is generated from brandColor
      accent: {
        50: '#f3fbfd',
        100: '#e7f7fa',
        200: '#c3ecf4',
        300: '#58cadf',
        400: '#40c2da',
        500: '#10b3d1',
        600: '#0ea1bc',
        700: '#0c869d',
        800: '#05363f',
        900: '#032228',
      },
      secondary: {
        50: '#f3fbfd',
        100: '#e7f7fa',
        200: '#c3ecf4',
        300: '#58cadf',
        400: '#40c2da',
        500: '#10b3d1',
        600: '#0ea1bc',
        700: '#0c869d',
        800: '#05363f',
        900: '#032228',
      },
      gray: {
        50: '#f8fafa',
        100: '#f1f4f6',
        200: '#dde4e8',
        300: '#9eb2bf',
        400: '#91a7b5',
        500: '#7591a3',
        600: '#698393',
        700: '#586d7a',
        800: '#232c31',
        900: '#161c1f',
      },
    };

    const result = fromBasicColors(plFeConfig);
    expect(result).toEqual(expected);
  });

  it('converts both legacy colors', () => {
    const plFeConfig = ImmutableMap({
      brandColor: '#0482d8',
      accentColor: '#2bd110',
    });

    const expected = {
      primary: {
        50: '#f2f9fd',
        100: '#e6f3fb',
        200: '#c0e0f5',
        300: '#4fa8e4',
        400: '#369be0',
        500: '#0482d8',
        600: '#0475c2',
        700: '#0362a2',
        800: '#012741',
        900: '#011929',
      },
      accent: {
        50: '#f4fdf3',
        100: '#eafae7',
        200: '#caf4c3',
        300: '#6bdf58',
        400: '#55da40',
        500: '#2bd110',
        600: '#27bc0e',
        700: '#209d0c',
        800: '#0d3f05',
        900: '#082803',
      },
      secondary: {
        50: '#f4fdf3',
        100: '#eafae7',
        200: '#caf4c3',
        300: '#6bdf58',
        400: '#55da40',
        500: '#2bd110',
        600: '#27bc0e',
        700: '#209d0c',
        800: '#0d3f05',
        900: '#082803',
      },
      gray: {
        50: '#f8fafa',
        100: '#f1f4f6',
        200: '#dde4e8',
        300: '#9eb2bf',
        400: '#91a7b5',
        500: '#7591a3',
        600: '#698393',
        700: '#586d7a',
        800: '#232c31',
        900: '#161c1f',
      },
    };

    const result = fromBasicColors(plFeConfig);
    expect(result).toEqual(expected);
  });
});

describe('expandPalette()', () => {
  it('expands one color', () => {
    const palette = { primary: '#0482d8' };

    const expected = {
      primary: {
        50: '#f2f9fd',
        100: '#e6f3fb',
        200: '#c0e0f5',
        300: '#4fa8e4',
        400: '#369be0',
        500: '#0482d8',
        600: '#0475c2',
        700: '#0362a2',
        800: '#012741',
        900: '#011929',
      },
    };

    const result = expandPalette(palette);
    expect(result).toEqual(expected);
  });

  it('expands mixed palette', () => {
    const palette = {
      primary: {
        50: '#f2f9fd',
        100: '#e6f3fb',
        200: '#c0e0f5',
        300: '#4fa8e4',
        400: '#369be0',
        500: '#0482d8',
        600: '#0475c2',
        700: '#0362a2',
        800: '#012741',
        900: '#011929',
      },
      accent: '#2bd110',
    };

    const expected = {
      primary: {
        50: '#f2f9fd',
        100: '#e6f3fb',
        200: '#c0e0f5',
        300: '#4fa8e4',
        400: '#369be0',
        500: '#0482d8',
        600: '#0475c2',
        700: '#0362a2',
        800: '#012741',
        900: '#011929',
      },
      accent: {
        50: '#f4fdf3',
        100: '#eafae7',
        200: '#caf4c3',
        300: '#6bdf58',
        400: '#55da40',
        500: '#2bd110',
        600: '#27bc0e',
        700: '#209d0c',
        800: '#0d3f05',
        900: '#082803',
      },
    };

    const result = expandPalette(palette);
    expect(result).toEqual(expected);
  });
});
