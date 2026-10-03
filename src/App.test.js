import { fireEvent, render, screen } from '@testing-library/react';
import Home from './pages/Home';

var mockNavigate;
jest.mock('./Components/PointillistScene', () => () => null);
jest.mock('react-router-dom', () => ({
  useNavigate: () => (...args) => mockNavigate(...args)
}), { virtual: true });

beforeEach(() => { mockNavigate = jest.fn(); });

test('moves between reading worlds and opens the selected catalogue shelf', () => {
  render(<Home />);
  expect(screen.getByRole('button', { name: /reading world 1: adventure/i })).toHaveAttribute('aria-current', 'step');
  fireEvent.keyDown(window, { key: 'ArrowRight' });
  expect(screen.getByRole('button', { name: /reading world 2: mystery/i })).toHaveAttribute('aria-current', 'step');

  fireEvent.click(screen.getByRole('button', { name: /explore mystery/i }));
  expect(mockNavigate).toHaveBeenCalledWith('/books', { state: { category: 'Mystery' } });
});
