describe('Menu Page - JWT Auth + Cart Flow', () => {
  beforeEach(() => {
      cy.window().then((win) => {
          win.localStorage.setItem('user', JSON.stringify({
              id: 1,
              name: 'Test User',
              email: 'user@example.com',
          }));
          win.localStorage.setItem('token', 'mock-jwt-token-123');
      });
      cy.visit('/menu/0');
  });

  it('renders the menu page', () => {
      cy.contains('Menu').should('be.visible');
  });

  it('shows menu items', () => {
      cy.contains('Iced Latte').should('be.visible');
      cy.contains('Almond Croissant').should('be.visible');
  });

  it('shows quantity selector buttons', () => {
      cy.contains('+').should('be.visible');
      cy.contains('−').should('be.visible');
  });

  it('increments quantity when + is clicked', () => {
      cy.get('.qty-btn').first().next().next().click();
      cy.get('.qty-display').first().should('contain', '1');
  });

  it('shows Add to Cart button after incrementing quantity', () => {
      cy.get('.qty-btn').last().click();
      cy.contains('Add to Cart').should('be.visible');
  });

  it('updates cart badge after adding to cart', () => {
      cy.get('.qty-btn').last().click();
      cy.contains('Add to Cart').click();
      cy.get('.cart-badge').should('be.visible');
  });

  it('shows Back to Stalls button', () => {
      cy.contains('Back to Stalls').should('be.visible');
  });

  it('navigates back to foodstalls on Back to Stalls click', () => {
      cy.contains('Back to Stalls').click();
      cy.url().should('include', '/foodstalls');
  });
});

describe('Order History - Reorder Flow', () => {
  beforeEach(() => {
      cy.window().then((win) => {
          win.localStorage.setItem('user', JSON.stringify({
              id: 1,
              name: 'Test User',
              email: 'user@example.com',
          }));
          win.localStorage.setItem('token', 'mock-jwt-token-123');
      });
      cy.visit('/order-history');
  });

  it('renders the order history page', () => {
      cy.contains('Order History').should('be.visible');
  });

  it('shows empty state or order list', () => {
      cy.get('body').then(($body) => {
          if ($body.text().includes('No orders yet')) {
              cy.contains('No orders yet').should('be.visible');
              cy.contains('Browse Restaurants').should('be.visible');
          } else {
              cy.get('.order-card').should('have.length.greaterThan', 0);
          }
      });
  });

  it('shows Order History active in navbar', () => {
      cy.get('.nav-icon-btn.active-route').should('contain', 'Order History');
  });

  it('shows Back to Restaurants button', () => {
      cy.contains('Back to Restaurants').should('be.visible');
  });
});