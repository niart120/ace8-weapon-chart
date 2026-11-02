// @vitest-environment happy-dom

import { fireEvent, render, cleanup } from '@testing-library/react';

import { afterEach, expect, test } from 'vitest';

import { useState } from 'react';

afterEach(cleanup);

function Toggle() {
  const [selected, setSelected] = useState(false);
  return (
    <button aria-pressed={selected} onClick={() => setSelected(!selected)}>
      ROLE
    </button>
  );
}

test('DOM環境でReactの操作と再描画を確認できる', () => {
  const { getByRole } = render(<Toggle />);

  const button = getByRole('button', { name: 'ROLE' });

  fireEvent.click(button);

  expect(button.getAttribute('aria-pressed')).toBe('true');
});
