// @vitest-environment happy-dom
import { fireEvent, render, cleanup } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { useState } from 'react';
afterEach(cleanup);
function Toggle() { const [selected, setSelected] = useState(false); return <button aria-pressed={selected} onClick={() => setSelected(!selected)}>ROLE</button>; }
test('DOMŠÂ‹«‚ÅReact‚Ì‘€ì‚ÆÄ•`‰æ‚ðŠm”F‚Å‚«‚é', () => {
  const { getByRole } = render(<Toggle />);
  const button = getByRole('button', { name: 'ROLE' });
  fireEvent.click(button);
  expect(button.getAttribute('aria-pressed')).toBe('true');
});
