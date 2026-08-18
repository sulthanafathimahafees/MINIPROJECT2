/**
 * OptiBuy Sales Executive API Service
 * Interacts with Node.js Express backend and PostgreSQL database
 */

const getAuthHeader = () => {
  const token = localStorage.getItem('optibuy_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetch Sales Executive Dashboard Statistics
 */
export async function getSalesDashboardStats() {
  const res = await fetch('/api/sales-person/dashboard/stats', {
    headers: { ...getAuthHeader() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch sales dashboard stats.');
  return data.stats;
}

/**
 * Fetch Sales Executive Profile
 */
export async function getSalesProfile() {
  const res = await fetch('/api/sales-person/profile', {
    headers: { ...getAuthHeader() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch sales profile.');
  return data.profile;
}

/**
 * Update Sales Executive Profile
 */
export async function updateSalesProfile(profileData) {
  const res = await fetch('/api/sales-person/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(profileData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update sales profile.');
  return data;
}

/**
 * Fetch Showroom Customer Directory
 */
export async function getShowroomCustomers() {
  const res = await fetch('/api/sales-person/customers', {
    headers: { ...getAuthHeader() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch customers directory.');
  return data.customers;
}

/**
 * Fetch Customer Assistance Requests
 */
export async function getCustomerAssistanceRequests() {
  const res = await fetch('/api/sales-person/requests', {
    headers: { ...getAuthHeader() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch assistance requests.');
  return data.requests;
}

/**
 * Update Customer Assistance Request Status
 */
export async function updateAssistanceRequestStatus(requestId, status, notes) {
  const res = await fetch(`/api/sales-person/requests/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ status, notes })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update request status.');
  return data;
}

/**
 * Create Product Recommendation for Customer
 */
export async function createProductRecommendation(recommendationData) {
  const res = await fetch('/api/sales-person/recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(recommendationData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create recommendation.');
  return data;
}

/**
 * Fetch Salesperson Product Recommendations
 */
export async function getProductRecommendations() {
  const res = await fetch('/api/sales-person/recommendations', {
    headers: { ...getAuthHeader() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch recommendations.');
  return data.recommendations;
}
