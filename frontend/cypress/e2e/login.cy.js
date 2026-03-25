describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/signin');
  });

  it('loads the signin page', () => {
    cy.url().should('include', '/signin');
  });

  it('shows error with invalid credentials', () => {
    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid', { timeout: 5000 }).should('exist');
  });

  it('logs in successfully with valid credentials', () => {
    cy.get('input[type="email"]').type('user@example.com');
    cy.get('input[type="password"]').type('Password123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 5000 }).should('include', '/foodstalls');
  });
});
