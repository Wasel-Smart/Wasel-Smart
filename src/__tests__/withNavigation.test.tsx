import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// We'll mock useNavigate to verify navigation calls.
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

import { withNavigation } from '../utils';

// Simple component that calls onNavigate when button clicked
const Dummy: React.FC<{ onNavigate?: (p: string) => void }> = ({ onNavigate }) => (
  <button onClick={() => onNavigate && onNavigate('dashboard')}>Go</button>
);

test('withNavigation provides onNavigate prop', () => {
  const Wrapped = withNavigation(Dummy as any) as React.ComponentType;

  const { getByText } = render(
    <MemoryRouter>
      <Wrapped />
    </MemoryRouter>
  );

  const btn = getByText('Go');
  expect(btn).toBeTruthy();
  fireEvent.click(btn);
  expect(mockNavigate).toHaveBeenCalledWith('/');
});
