export const getServiceId = service => service?._id || service?.id;

export const getTransactionId = transaction =>
  transaction?._id || transaction?.mongoId || transaction?.id;

export const formatCurrency = price => {
  const number = Number(price);
  if (!Number.isFinite(number)) {
    return '0 đ';
  }
  return `${Math.round(number)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')} đ`;
};

export const formatDateTime = value => {
  if (!value) {
    return 'Chưa có thông tin';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleString('vi-VN');
};

export const formatShortDateTime = value => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getCreatorName = service => {
  const creator =
    service?.createdBy || service?.creator || service?.user || service?.author;
  if (typeof creator === 'string') {
    return creator;
  }
  return (
    creator?.name ||
    creator?.fullName ||
    creator?.phone ||
    service?.creatorName ||
    'Chưa có thông tin'
  );
};

export const getCustomerName = transaction => {
  const customer = transaction?.customer;
  if (typeof customer === 'string') {
    return customer;
  }
  return customer?.name || transaction?.customerName || 'Chưa có thông tin';
};
