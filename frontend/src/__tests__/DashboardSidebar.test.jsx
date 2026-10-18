import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardSidebar from '../components/common/DashboardSidebar';

describe('DashboardSidebar Component Customer Navigation Unit Tests', () => {
  it('renders all required customer navigation links when role is CUSTOMER', () => {
    render(
      <MemoryRouter>
        <DashboardSidebar role="CUSTOMER" isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    // Core Customer Features navigation check
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    expect(screen.getByText('Browse Products')).toBeInTheDocument();
    expect(screen.getByText('Product Match Score')).toBeInTheDocument();
    expect(screen.getByText('Saved Wishlist')).toBeInTheDocument();
    expect(screen.getByText('Compare Devices')).toBeInTheDocument();
    expect(screen.getByText('Floor Assistance')).toBeInTheDocument();
    expect(screen.getByText('My Orders')).toBeInTheDocument();
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Profile & Preferences')).toBeInTheDocument();
    expect(screen.getByText('Logout Account')).toBeInTheDocument();
  });

  it('renders sales person items when role is SALES_EXECUTIVE', () => {
    render(
      <MemoryRouter>
        <DashboardSidebar role="SALES_EXECUTIVE" isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText('Active Customers')).toBeInTheDocument();
    expect(screen.getByText('Inventory Monitor')).toBeInTheDocument();
  });
});
