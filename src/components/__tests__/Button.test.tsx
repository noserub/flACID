/**
 * Button Component Tests
 *
 * For components that need providers (e.g., theme, router), use render from
 * src/utils/testUtils instead of @testing-library/react.
 */

import { render, screen } from '@testing-library/react';
import { Button } from '../ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders as a button element by default', () => {
    render(<Button>Submit</Button>);
    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });
});
