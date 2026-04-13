describe('Logout Flow', () => {
    beforeEach(() => {
        // Seed localStorage with a logged-in user
        cy.window().then((win) => {
            win.localStorage.setItem('user', JSON.stringify({
                id: 1,
                name: 'Test User',
                email: 'user@example.com',
            }));
        });
        cy.visit('/foodstalls');
    });

    it('user lands on /foodstalls after login', () => {
        cy.url().should('include', '/foodstalls');
    });

    it('clicking Sign Out redirects to /signin', () => {
        cy.contains('Sign Out').click();
        cy.url().should('include', '/signin');
    });

    it('localStorage is cleared after sign out', () => {
        cy.contains('Sign Out').click();
        cy.window().then((win) => {
            expect(win.localStorage.getItem('user')).to.be.null;
            expect(win.localStorage.getItem('cart')).to.be.null;
        });
    });

    it('navigating to /foodstalls after logout redirects back to /signin', () => {
        cy.contains('Sign Out').click();
        cy.visit('/foodstalls');
        cy.url().should('include', '/signin');
    });
});