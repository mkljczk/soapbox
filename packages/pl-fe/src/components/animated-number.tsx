import React, { useEffect, useState } from 'react';
import { useIntl, type IntlShape } from 'react-intl';
import { TransitionMotion, spring } from 'react-motion';

import { useSettings } from 'pl-fe/hooks/use-settings';
import { isNumber, roundDown } from 'pl-fe/utils/numbers';

const obfuscatedCount = (count: number): string => {
  if (count < 0) {
    return '0';
  } else if (count <= 1) {
    return count.toString();
  } else {
    return '1+';
  }
};

const shortNumberFormat = (number: any, intl: IntlShape, max?: number) => {
  if (!isNumber(number)) return '•';

  let value = number;
  let factor: string = '';
  if (number >= 1000 && number < 1000000) {
    factor = 'k';
    value = roundDown(value / 1000);
  } else if (number >= 1000000) {
    factor = 'M';
    value = roundDown(value / 1000000);
  }

  if (max && value > max) {
    return `${max}+`;
  }

  return intl.formatNumber(value, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    maximumSignificantDigits: 3,
    numberingSystem: 'latn',
    style: 'decimal',
  }) + factor;
};

interface IAnimatedNumber {
  value: number;
  obfuscate?: boolean;
  short?: boolean;
  max?: number;
}

const AnimatedNumber: React.FC<IAnimatedNumber> = ({ value, obfuscate, short, max }) => {
  const intl = useIntl();
  const { reduceMotion } = useSettings();

  const [direction, setDirection] = useState(1);
  const [displayedValue, setDisplayedValue] = useState<number>(value);
  const [formattedValue, setFormattedValue] = useState<string>(intl.formatNumber(value, { numberingSystem: 'latn' }));

  useEffect(() => {
    if (displayedValue !== undefined) {
      if (value > displayedValue) setDirection(1);
      else if (value < displayedValue) setDirection(-1);
    }

    setDisplayedValue(value);
    setFormattedValue(obfuscate
      ? obfuscatedCount(value)
      : short
        ? shortNumberFormat(value, intl, max)
        : intl.formatNumber(value, { numberingSystem: 'latn' }));
  }, [value]);

  const willEnter = () => ({ y: -1 * direction });

  const willLeave = () => ({ y: spring(1 * direction, { damping: 35, stiffness: 400 }) });

  if (reduceMotion) {
    return <>{formattedValue}</>;
  }

  const styles = [{
    key: `${formattedValue}`,
    data: formattedValue,
    style: { y: spring(0, { damping: 35, stiffness: 400 }) },
  }];

  return (
    <TransitionMotion styles={styles} willEnter={willEnter} willLeave={willLeave}>
      {items => (
        <span className='relative inline-flex flex-col items-stretch overflow-hidden'>
          {items.map(({ key, data, style }) => (
            <span
              key={key}
              style={{ position: (direction * style.y) > 0 ? 'absolute' : 'static', transform: `translateY(${style.y * 100}%)` }}
            >
              {data}
            </span>
          ))}
        </span>
      )}
    </TransitionMotion>
  );
};

export { AnimatedNumber as default };
