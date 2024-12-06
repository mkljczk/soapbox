import { instanceSchema } from 'pl-api';
import React from 'react';
import * as v from 'valibot';

import { fireEvent, render, screen } from 'pl-fe/jest/test-helpers';

import LoginForm from './login-form';

describe('<LoginForm />', () => {
  it('renders for Pleroma', () => {
    const mockFn = vi.fn();
    const store = {
      instance: v.parse(instanceSchema, {
        version: '2.7.2 (compatible; Pleroma 2.3.0)',
      }),
    };

    render(<LoginForm handleSubmit={mockFn} isLoading={false} />, undefined, store);

    expect(screen.getByRole('heading')).toHaveTextContent(/sign in/i);
  });

  it('renders for Mastodon', () => {
    const mockFn = vi.fn();
    const store = {
      instance: v.parse(instanceSchema, {
        version: '3.0.0',
      }),
    };

    render(<LoginForm handleSubmit={mockFn} isLoading={false} />, undefined, store);

    expect(screen.getByRole('heading')).toHaveTextContent(/sign in/i);
  });

  it('responds to the handleSubmit prop', () => {
    const mockFn = vi.fn();
    render(<LoginForm handleSubmit={mockFn} isLoading={false} />);
    fireEvent.submit(screen.getByTestId(/button/i));

    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
