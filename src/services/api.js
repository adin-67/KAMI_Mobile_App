import { API_BASE_URL } from '../constants/config';

const getErrorMessage = (data, status) => {
  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  return data?.message || data?.error || `Yêu cầu thất bại. Mã lỗi: ${status}`;
};

const request = async (path, options = {}) => {
  const { method = 'GET', token, body } = options;
  const headers = { Accept: 'application/json' };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('Không thể kết nối máy chủ. Hãy kiểm tra Internet.');
  }

  const responseText = await response.text();
  let data = null;
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(data, response.status));
  }
  return data;
};

const getArrayData = (data, propertyName) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  if (Array.isArray(data?.[propertyName])) {
    return data[propertyName];
  }
  return [];
};

export const login = async (phone, password) => {
  const data = await request('/auth', {
    method: 'POST',
    body: { phone: phone.trim(), password },
  });
  const token =
    (typeof data === 'string' ? data : null) ||
    data?.token ||
    data?.accessToken ||
    data?.data?.token;

  if (!token) {
    throw new Error('Đăng nhập thành công nhưng máy chủ không trả về token.');
  }
  return token;
};

export const getServices = async token => {
  const data = await request('/services', { token });
  return getArrayData(data, 'services');
};

export const getService = async (id, token) => {
  const data = await request(`/services/${id}`, { token });
  return data?.data || data;
};

export const addService = (service, token) =>
  request('/services', { method: 'POST', token, body: service });

export const updateService = (id, service, token) =>
  request(`/services/${id}`, {
    method: 'PUT',
    token,
    body: service,
  });

export const deleteService = (id, token) =>
  request(`/services/${id}`, { method: 'DELETE', token });

export const getCustomers = async token => {
  const data = await request('/customers', { token });
  return getArrayData(data, 'customers');
};

export const addCustomer = (customer, token) =>
  request('/customers', {
    method: 'POST',
    token,
    body: customer,
  });

export const getTransactions = async token => {
  const data = await request('/transactions', { token });
  return getArrayData(data, 'transactions');
};

export const getTransaction = async (id, token) => {
  const data = await request(`/transactions/${id}`, { token });
  return data?.data || data;
};
