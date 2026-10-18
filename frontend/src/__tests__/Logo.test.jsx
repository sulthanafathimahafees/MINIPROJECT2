import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Logo from '../components/common/Logo';

describe('Logo Component Unit Tests', () => {
  it('renders OptiBuy brand name and AI badge', () => {
    render(
      <MemoryRouter>
        <Logo />
      </MemoryRouter>
    );

    expect(screen.getByText(/Opti/i)).toBeInTheDocument();
    expect(screen.getByText(/Buy/i)).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('displays the tagline by default', () => {
    render(
      <MemoryRouter>
        <Logo showTagline={true} />
      </MemoryRouter>
    );

    expect(screen.getByText('Smart Choices. Smarter Shopping.')).toBeInTheDocument();
  });

  it('hides the tagline when showTagline is false', () => {
    render(
      <MemoryRouter>
        <Logo showTagline={false} />
      </MemoryRouter>
    );

    expect(screen.queryByText('Smart Choices. Smarter Shopping.')).not.toBeInTheDocument();
  });
});
