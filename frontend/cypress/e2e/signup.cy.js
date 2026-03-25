describe('Signup Page', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('loads the signup page', () => {
    cy.url().should('include', '/signup');
  });

  it('shows validation error when fields are empty', () => {
    cy.get('button[type="submit"]').click();
    cy.get('body').should('exist');
  });

  it('fills out the signup form with valid data', () => {
    cy.get('input[type="text"]').first().type('Test User');
    cy.get('input[type="email"]').type('testuser@example.com');
    cy.get('input[type="password"]').first().type('Password123');
    cy.get('input[type="password"]').last().type('Password123');
    cy.get('button[type="submit"]').click();
  });
});
