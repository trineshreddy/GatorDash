describe('Cart', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ name: 'Test User', email: 'user@example.com' }));
    cy.visit('/menu/0');
  });

  it('loads the menu page for stall 0', () => {
    cy.url().should('include', '/menu/0');
  });

  it('displays Add to Cart buttons', () => {
    cy.contains('Add to Cart').should('exist');
  });

  it('adds an item to cart', () => {
    cy.contains('Add to Cart').first().click();
    cy.window().then((win) => {
      const cart = JSON.parse(win.localStorage.getItem('cart') || '[]');
      expect(cart.length).to.be.greaterThan(0);
    });
  });
});
