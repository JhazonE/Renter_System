jest.mock('../config', () => ({ API_BASE_URL: 'http://test', MOBILE_API_KEY: '' }));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      post: jest.fn(),
    })),
  },
}));

import { client } from '../api';
import { fetchAlerts } from '../api';

const mockPost = client.post;

beforeEach(() => mockPost.mockReset());

test('posts registration, phone and limit and returns data', async () => {
  mockPost.mockResolvedValue({ data: { alerts: [{ id: 1 }] } });
  const result = await fetchAlerts({ registrationNumber: '100245', phone: '09171234567' });
  expect(mockPost).toHaveBeenCalledWith('/api/push/alerts', {
    registrationNumber: '100245',
    phone: '09171234567',
    limit: 100,
  });
  expect(result).toEqual({ alerts: [{ id: 1 }] });
});

test('throws a friendly error from the server body', async () => {
  mockPost.mockRejectedValue({ response: { data: { error: 'Phone number does not match this registration' } } });
  await expect(fetchAlerts({ registrationNumber: 'x', phone: 'y' }))
    .rejects.toThrow('Phone number does not match this registration');
});
