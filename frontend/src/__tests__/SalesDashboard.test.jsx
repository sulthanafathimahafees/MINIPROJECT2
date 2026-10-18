import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SalesDashboard from '../pages/dashboards/SalesDashboard';
import * as salesService from '../services/salesService';
import * as authService from '../services/authService';

// Mock authService
vi.mock('../services/authService', () => ({
  getStoredUser: vi.fn(() => ({
    userId: 9,
    full_name: 'Neeva Sales Executive',
    fullName: 'Neeva Sales Executive',
    email: 'neeva@gmail.com',
    role: 'SALES_PERSON',
    status: 'ACTIVE'
  })),
  logoutUser: vi.fn()
}));

// Mock ThemeContext
vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: vi.fn() })
}));

// Mock salesService
vi.mock('../services/salesService', () => ({
  getSalesDashboardStats: vi.fn(),
  getSalesProfile: vi.fn(),
  updateSalesProfile: vi.fn(),
  getShowroomCustomers: vi.fn(),
  getCustomerAssistanceRequests: vi.fn(),
  updateAssistanceRequestStatus: vi.fn(),
  assignAssistanceRequest: vi.fn(),
  createProductRecommendation: vi.fn(),
  getProductRecommendations: vi.fn(),
  getTailoredMatches: vi.fn(),
  getSalesInventory: vi.fn()
}));

const mockStats = {
  mySalesINR: 0,
  myOrdersCount: 0,
  monthlyTargetINR: 750000,
  targetProgressPct: 0,
  activeCustomersCount: 3,
  productsAssistedCount: 25,
  totalRequestsCount: 2,
  pendingRequestsCount: 1,
  inProgressRequestsCount: 1,
  resolvedRequestsCount: 0,
  lowStockCount: 2,
  outOfStockCount: 1,
  inStockCount: 22,
  myRecommendationsCount: 1
};

const mockRequests = [
  {
    id: 101,
    customerId: 4,
    customerName: 'Arya Customer',
    customerEmail: 'aryadileep@gmail.com',
    customerPhone: '+91 98765 00000',
    requestType: 'PRODUCT_INQUIRY',
    status: 'NEW',
    notes: 'Looking for a lightweight laptop under 60k with good battery',
    preferredCategory: 'Laptops & PCs',
    preferredBrand: 'Apple',
    budgetMin: 50000,
    budgetMax: 70000,
    preferredFeatures: ['M2 Chip', 'Retina Display'],
    productName: 'MacBook Air M2',
    productPrice: 65000,
    productImage: null,
    salesPersonId: null,
    assignedSalesPerson: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 102,
    customerId: 17,
    customerName: 'John Buyer',
    customerEmail: 'john@example.com',
    customerPhone: '+91 98765 11111',
    requestType: 'GENERAL_ASSISTANCE',
    status: 'IN_PROGRESS',
    notes: 'Need recommendation for high-resolution 4K TV',
    preferredCategory: 'Smart TVs',
    preferredBrand: 'Sony',
    budgetMin: 80000,
    budgetMax: 120000,
    preferredFeatures: ['OLED', '120Hz'],
    productName: 'Sony Bravia 4K OLED',
    productPrice: 95000,
    productImage: null,
    salesPersonId: 9,
    assignedSalesPerson: 'Neeva Sales Executive',
    createdAt: new Date().toISOString()
  }
];

const mockProducts = [
  {
    id: 1,
    product_id: 1,
    name: 'iPhone 15 Pro',
    product_name: 'iPhone 15 Pro',
    brand: 'Apple',
    category: 'Smartphones',
    price: 134900,
    stock: 12,
    stock_quantity: 12,
    stock_status: 'IN_STOCK'
  },
  {
    id: 2,
    product_id: 2,
    name: 'Sony WH-1000XM5',
    product_name: 'Sony WH-1000XM5',
    brand: 'Sony',
    category: 'Audio',
    price: 29990,
    stock: 3,
    stock_quantity: 3,
    stock_status: 'LOW_STOCK'
  },
  {
    id: 3,
    product_id: 3,
    name: 'Samsung OLED 4K 65',
    product_name: 'Samsung OLED 4K 65',
    brand: 'Samsung',
    category: 'Smart TVs',
    price: 189990,
    stock: 0,
    stock_quantity: 0,
    stock_status: 'OUT_OF_STOCK'
  }
];

describe('SalesDashboard Component Unit & Integration Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/products/sales/inventory')) {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true, products: mockProducts })
        });
      }
      if (url.includes('/api/orders/my-orders')) {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true, orders: [] })
        });
      }
      if (url.includes('/api/products/reviews/all')) {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true, reviews: [] })
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true })
      });
    });

    salesService.getSalesDashboardStats.mockResolvedValue(mockStats);
    salesService.getCustomerAssistanceRequests.mockResolvedValue(mockRequests);
    salesService.getProductRecommendations.mockResolvedValue([]);
    salesService.getShowroomCustomers.mockResolvedValue([]);
    salesService.getSalesProfile.mockResolvedValue({
      fullName: 'Neeva Sales Executive',
      phone: '+91 98765 43210',
      showroomSection: 'Smartphones & Laptops'
    });
  });

  it('renders Overview tab with authentic KPI data and no dummy fallbacks', async () => {
    render(
      <MemoryRouter initialEntries={['/#overview']}>
        <SalesDashboard />
      </MemoryRouter>
    );

    // Sales Executive Greeting
    await waitFor(() => {
      expect(screen.getByText(/Good morning, Neeva Sales Executive/i)).toBeInTheDocument();
    });

    // Zero sales correctly rendered as ₹0 (no dummy ₹12,50,000)
    expect(screen.getAllByText('₹0').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Attributed showroom sales')).toBeInTheDocument();

    // Monthly Sales Target card
    expect(screen.getByText('Monthly Sales Target')).toBeInTheDocument();
    expect(screen.getByText('0% Achieved')).toBeInTheDocument();
    expect(screen.getByText(/No Completed Sales Yet/i)).toBeInTheDocument();

    // Operational summary
    expect(screen.getByText('Assistance & Stock Health')).toBeInTheDocument();
  });

  it('renders Customer Assistance requests with full customer requirements, preferences, and action buttons', async () => {
    render(
      <MemoryRouter initialEntries={['/#assistance']}>
        <SalesDashboard />
      </MemoryRouter>
    );

    // Header & Filter buttons
    await waitFor(() => {
      expect(screen.getByText('Customer Assistance Requests')).toBeInTheDocument();
    });

    expect(screen.getByText('All Requests')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();

    // Request 101 requirements & preferences
    expect(screen.getByText('Arya Customer')).toBeInTheDocument();
    expect(screen.getByText(/Looking for a lightweight laptop under 60k/i)).toBeInTheDocument();
    expect(screen.getByText('Category: Laptops & PCs')).toBeInTheDocument();
    expect(screen.getByText('Brand: Apple')).toBeInTheDocument();
    expect(screen.getByText('Unassigned Floor Request')).toBeInTheDocument();
    expect(screen.getByText('Accept & Assist')).toBeInTheDocument();

    // Request 102 (In Progress, assigned to self)
    expect(screen.getByText('John Buyer')).toBeInTheDocument();
    expect(screen.getByText('Assigned to You')).toBeInTheDocument();
    expect(screen.getByText('Tailored Recommendation')).toBeInTheDocument();
    expect(screen.getByText('Mark Completed')).toBeInTheDocument();
  });

  it('renders Showroom Inventory with live stock badges and read-only notice', async () => {
    render(
      <MemoryRouter initialEntries={['/#inventory']}>
        <SalesDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Showroom Product Availability')).toBeInTheDocument();
    });

    // Read-only notice
    expect(screen.getByText(/Showroom Floor Inventory View \(Read-Only\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Modifying stock levels.*strictly restricted to Showroom Administrators/i)).toBeInTheDocument();

    // Product stock items & badges
    expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
    expect(screen.getByText('IN STOCK')).toBeInTheDocument();

    expect(screen.getByText('Sony WH-1000XM5')).toBeInTheDocument();
    expect(screen.getByText('LOW STOCK')).toBeInTheDocument();

    expect(screen.getByText('Samsung OLED 4K 65')).toBeInTheDocument();
    expect(screen.getByText('OUT OF STOCK')).toBeInTheDocument();
  });

});
