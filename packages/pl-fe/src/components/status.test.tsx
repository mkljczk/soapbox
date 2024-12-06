import React from 'react';

import { buildAccount } from 'pl-fe/jest/factory';
import { render, screen, rootState } from 'pl-fe/jest/test-helpers';
import { normalizeStatus } from 'pl-fe/normalizers/status';

import Status from './status';

import type { ReducerStatus } from 'pl-fe/reducers/statuses';

const account = buildAccount({
  id: '1',
  acct: 'alex',
});

const status = normalizeStatus({
  id: '1',
  account,
  content: 'hello world',
  contentHtml: 'hello world',
}) as ReducerStatus;

describe('<Status />', () => {
  const state = rootState/*.accounts.set('1', account)*/;

  it('renders content', () => {
    render(<Status status={status} />, undefined, state);
    screen.getByText(/hello world/i);
    expect(screen.getByTestId('status')).toHaveTextContent(/hello world/i);
  });

  describe('the Status Action Bar', () => {
    it('is rendered', () => {
      render(<Status status={status} />, undefined, state);
      expect(screen.getByTestId('status-action-bar')).toBeInTheDocument();
    });
  });
});
