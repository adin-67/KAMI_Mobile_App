import { formatCurrency, getServiceId } from '../src/utils/formatters';

describe('service formatters', () => {
  it('formats a price in Vietnamese currency style', () => {
    expect(formatCurrency(150000)).toBe('150.000 đ');
  });

  it('supports both MongoDB and common id fields', () => {
    expect(getServiceId({ _id: 'mongo-id' })).toBe('mongo-id');
    expect(getServiceId({ id: 'normal-id' })).toBe('normal-id');
  });
});
