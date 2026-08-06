export const getServiceId = service => service?._id || service?.id;

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
