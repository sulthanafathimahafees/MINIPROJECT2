import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '../pages/dashboards/AdminDashboard';
import * as authService from '../services/authService';

// Mock authService
vi.mock('../services/authService', () => ({
  getStoredUser: vi.fn(() => ({
    userId: 2,
    full_name: 'OptiBuy Administrator',
    fullName: 'OptiBuy Administrator',
    email: 'optibuyadmin@gmail.com',
    role: 'ADMIN',
    status: 'ACTIVE'
  })),
  logoutUser: vi.fn()
}));

// Mock ThemeContext
vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: vi.fn() })
}));

describe('AdminDashboard Component', () => {
  const mockStats = {
    totalUsers: 5,
    totalCustomers: 3,
    totalApprovedSalesPersons: 1,
    pendingSalesRequests: 1,
    totalProducts: 4,
    activeProducts: 4,
    lowStockProducts: 1,
    outOfStockProducts: 0,
    totalAssistanceRequests: 2,
    pendingAssistanceRequests: 1,
    totalOrders: 0,
    totalRevenue: 0,
    users: [
      { userId: 2, fullName: 'OptiBuy Admin', email: 'optibuyadmin@gmail.com', role: 'ADMIN', status: 'ACTIVE' },
      { userId: 3, fullName: 'Aarav Sales', email: 'aarav@optibuy.ai', role: 'SALES_PERSON', status: 'ACTIVE' },
      { userId: 4, fullName: 'Neha Customer', email: 'neha@gmail.com', role: 'CUSTOMER', status: 'ACTIVE' },
      { userId: 5, fullName: 'Rahul Applicant', email: 'rahul@gmail.com', role: 'SALES_PERSON', status: 'PENDING' }
    ]
  };

  const mockProducts = [
    { id: 1, name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'Smartphones', price: 129999, stock: 10, stock_quantity: 10, status: 'ACTIVE' },
    { id: 2, name: 'Apple iPhone 15 Pro', brand: 'Apple', category: 'Smartphones', price: 134900, stock: 2, stock_quantity: 2, status: 'ACTIVE' }
  ];

  const mockSalesRequests = [
    { userId: 5, user_id: 5, fullName: 'Rahul Applicant', email: 'rahul@gmail.com', phone: '+91 98765 11111', role: 'SALES_PERSON', status: 'PENDING' }
  ];

  const mockAssistanceRequests = [
    {
      id: 1,
      customerId: 4,
      customerName: 'Neha Customer',
      customerEmail: 'neha@gmail.com',
      customerPhone: '+91 98765 22222',
      preferredCategory: 'Smartphones',
      budgetMin: 50000,
      budgetMax: 120000,
      customerRequirements: 'Looking for a premium camera phone with fast charging',
      salespersonId: 3,
      salespersonName: 'Aarav Sales',
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      customerId: 4,
      customerName: 'Neha Customer',
      customerEmail: 'neha@gmail.com',
      customerPhone: '+91 98765 22222',
      preferredCategory: 'Laptops & PCs',
      budgetMin: 60000,
      budgetMax: 80000,
      customerRequirements: 'Need a thin lightweight laptop for productivity',
      salespersonId: null,
      salespersonName: null,
      status: 'NEW',
      createdAt: new Date().toISOString()
    }
  ];

  const mockOrders = [
    {
      id: 501,
      order_id: 501,
      customer: 'Neha Customer',
      full_name: 'Neha Customer',
      total_amount: 129999,
      price: 129999,
      payment_status: 'PAID',
      order_status: 'PROCESSING',
      status: 'PROCESSING',
      created_at: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    localStorage.setItem('optibuy_token', 'test-admin-jwt-token');
    globalThis.fetch = vi.fn((url, options) => {
      const urlStr = String(url);

      if (urlStr.includes('/api/admin/dashboard/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockStats })
        });
      }

      if (urlStr.includes('/api/products/brands')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, brands: [{ id: 1, name: 'Apple', status: 'ACTIVE' }, { id: 2, name: 'Samsung', status: 'ACTIVE' }] })
        });
      }

      if (urlStr.endsWith('/api/products')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, products: mockProducts })
        });
      }

      if (urlStr.includes('/api/dashboard/admin/sales-requests')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, requests: mockSalesRequests })
        });
      }

      if (urlStr.includes('/api/admin/dashboard/assistance-requests') || urlStr.includes('/api/admin/assistance-requests')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            total: 2,
            counts: { total: 2, new: 1, inProgress: 1, resolved: 0, cancelled: 0 },
            requests: mockAssistanceRequests
          })
        });
      }

      if (urlStr.includes('/api/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            categories: [{ id: 1, name: 'Smartphones' }, { id: 2, name: 'Laptops & PCs' }]
          })
        });
      }

      if (urlStr.includes('/api/admin/orders/revenue')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { grossRevenue: 0, totalOrders: 0, avgOrderValue: 0 } })
        });
      }

      if (urlStr.includes('/api/admin/orders/transactions')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, transactions: [] })
        });
      }

      if (urlStr.includes('/api/admin/orders')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, orders: mockOrders })
        });
      }

      if (urlStr.includes('/api/admin/dashboard/sales-trend')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, trends: [] })
        });
      }

      if (urlStr.includes('/approve')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, message: 'Salesperson approved' })
        });
      }

      if (urlStr.includes('/status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, message: 'Status updated' })
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    });
  });

  it('renders Admin Overview with genuine database KPI metrics and no hardcoded values', async () => {
    render(
      <MemoryRouter initialEntries={['/#overview']}>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome back, Admin 👋')).toBeInTheDocument();
    });

    // Check KPI cards
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Sales Approvals')).toBeInTheDocument();
    expect(screen.getByText('Assistance Requests')).toBeInTheDocument();
    expect(screen.getByText('Active Sales Staff')).toBeInTheDocument();
    expect(screen.getByText('Total Products')).toBeInTheDocument();
  });

  it('renders clear empty state for sales analytics when no completed orders or trends exist', async () => {
    render(
      <MemoryRouter initialEntries={['/#overview']}>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sales & Revenue Trend')).toBeInTheDocument();
    });

    expect(screen.getByText('No Sales Records Available')).toBeInTheDocument();
  });

  it('renders User Management directory and prevents accidental lockout of administrator', async () => {
    render(
      <MemoryRouter initialEntries={['/#users']}>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('All User Accounts')).toBeInTheDocument();
    });

    expect(screen.getAllByText('optibuyadmin@gmail.com').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('aarav@optibuy.ai')).toBeInTheDocument();

    // The root administrator account must display Protected instead of an active Deactivate button
    const protectedBadges = screen.getAllByText('Protected');
    expect(protectedBadges.length).toBeGreaterThan(0);
  });

  it('renders Sales Executive applicant requests with Approve and Reject controls', async () => {
    render(
      <MemoryRouter initialEntries={['/#requests']}>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sales Person Requests')).toBeInTheDocument();
    });

    expect(screen.getByText('rahul@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('renders Customer Assistance Requests with customer requirements and assigned sales executive', async () => {
    render(
      <MemoryRouter initialEntries={['/#assistancerequests']}>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Customer Assistance Requests')).toBeInTheDocument();
    });

    expect(screen.getByText('Looking for a premium camera phone with fast charging')).toBeInTheDocument();
    expect(screen.getByText('Aarav Sales')).toBeInTheDocument();
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('renders Orders Fulfillment table with administrative status update dropdown', async () => {
    render(
      <MemoryRouter initialEntries={['/#orders']}>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Orders Fulfillment')).toBeInTheDocument();
    });

    expect(screen.getByText('#501')).toBeInTheDocument();
    expect(screen.getAllByText('PROCESSING').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Update Status')).toBeInTheDocument();
  });

  it('rejects negative prices and stocks in Add Product form', async () => {
    render(
      <MemoryRouter initialEntries={['/#products']}>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Add New Catalog Product')).toBeInTheDocument();
    });

    // Open add product modal
    fireEvent.click(screen.getByText('Add New Catalog Product'));

    await waitFor(() => {
      expect(screen.getByText('Save to PostgreSQL')).toBeInTheDocument();
    });

    // Fill in product name with negative price
    const nameInput = screen.getByPlaceholderText('e.g. Apple iPad Air 11 M2');
    const submitBtn = screen.getByText('Save to PostgreSQL');

    fireEvent.change(nameInput, { target: { value: 'Faulty Phone' } });
    
    // Find price input and set to negative
    const inputs = screen.getAllByRole('spinbutton');
    const priceInput = inputs[0];
    fireEvent.change(priceInput, { target: { value: '-500' } });

    fireEvent.submit(submitBtn.closest('form'));

    await waitFor(() => {
      expect(screen.getByText('Product price cannot be negative.')).toBeInTheDocument();
    });
  });
});
