import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test } from 'vitest';
import App from '../App';

afterEach(cleanup);

test('カウンターをクリックすると表示が 1 増える', async () => {
  const user = userEvent.setup();
  render(<App />);
  const button = screen.getByRole('button', { name: 'Count is 0' });
  await user.click(button);
  expect(button.textContent).toBe('Count is 1');
});
