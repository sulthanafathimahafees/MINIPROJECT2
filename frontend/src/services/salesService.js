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
 * Fetch Customer Assistance Requests (with optional status filter)
 */
export async function getCustomerAssistanceRequests(status = '') {
  const url = status && status !== 'ALL'
    ? `/api/sales-person/requests?status=${encodeURIComponent(status)}`
    : '/api/sales-person/requests';
  const res = await fetch(url, {
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

/**
 * Log a sales activity
 */
export async function logSalesActivity(activityData) {
  const res = await fetch('/api/sales-person/activities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(activityData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to log activity.');
  return data.activity;
}

/**
 * Get sales activities
 */
export async function getSalesActivities(limit = 50, offset = 0) {
  const res = await fetch(`/api/sales-person/activities?limit=${limit}&offset=${offset}`, {
    headers: { ...getAuthHeader() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch activities.');
  return data.activities;
}

/**
 * Get sales performance metrics
 */
export async function getSalesPerformance() {
  const res = await fetch('/api/sales-person/performance', {
    headers: { ...getAuthHeader() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch performance metrics.');
  return data.performance;
}

/**
 * Get detailed customer info for sales context
 */
export async function getCustomerDetail(customerId) {
  const res = await fetch(`/api/sales-person/customers/${customerId}`, {
    headers: { ...getAuthHeader() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch customer details.');
  return data.customer;
}

/**
 * Assign assistance request to this sales person
 */
export async function assignAssistanceRequest(requestId, status = 'IN_PROGRESS') {
  const res = await fetch(`/api/sales-person/requests/${requestId}/assign`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to assign request.');
  return data.request;
}

/**
 * Fetch Tailored Products with OptiBuy Match Scores for a customer
 */
export async function getTailoredMatches(customerId, category = 'All') {
  const catParam = category && category !== 'All' ? `&category=${encodeURIComponent(category)}` : '';
  const res = await fetch(`/api/sales-person/recommendations/match-scores?customerId=${customerId}${catParam}`, {
    headers: { ...getAuthHeader() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch tailored product matches.');
  return data;
}

/**
 * Fetch Showroom Product Inventory (Read-Only)
 */
export async function getSalesInventory(inStockOnly = false) {
  const url = inStockOnly ? '/api/products/sales/inventory?inStockOnly=true' : '/api/products/sales/inventory';
  const res = await fetch(url, {
    headers: { ...getAuthHeader() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch showroom inventory.');
  return data.products;
}
