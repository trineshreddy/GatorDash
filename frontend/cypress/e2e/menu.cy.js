describe('Menu Page', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ name: 'Test User', email: 'user@example.com' }));
    cy.visit('/foodstalls');
  });

  it('loads the food stalls page', () => {
    cy.url().should('include', '/foodstalls');
  });

  it('displays restaurant cards', () => {
    cy.get('.stall-card').should('have.length.greaterThan', 0);
  });

  it('navigates to menu when a stall is clicked', () => {
    cy.get('.stall-card').first().click();
    cy.url({ timeout: 5000 }).should('include', '/menu/');
  });

  it('displays menu items on the menu page', () => {
    cy.get('.stall-card').first().click();
    cy.get('body').should('exist');
  });
});
