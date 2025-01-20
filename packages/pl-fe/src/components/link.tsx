import { Link as Comp, type LinkComponentProps } from '@tanstack/react-router';
import React from 'react';

const Link = (props: LinkComponentProps) => (
  <Comp
    {...props}
    className='text-primary-600 hover:underline dark:text-accent-blue'
  />
);

export { Link as default };
