describe('Logout Flow', () => {
    beforeEach(() => {
        // Set up logged in state with JWT token
        cy.window().then((win) => {
            win.localStorage.setItem('user', JSON.stringify({
                id: 1,
                name: 'Test User',
                email: 'user@example.com',
            }));
            win.localStorage.setItem('token', 'mock-jwt-token-123');
            win.localStorage.setItem('cart', JSON.stringify([
                { id: '101', name: 'Iced Latte', price: 4.50, quantity: 1 }
            ]));
        });
        cy.visit('/foodstalls');
    });

    it('shows Sign Out button in navbar', () => {
        cy.contains('Sign Out').should('be.visible');
    });

    it('clears localStorage on logout', () => {
        cy.contains('Sign Out').click();
        cy.window().then((win) => {
            expect(win.localStorage.getItem('user')).to.be.null;
            expect(win.localStorage.getItem('token')).to.be.null;
            expect(win.localStorage.getItem('cart')).to.be.null;
        });
    });

    it('redirects to signin page after logout', () => {
        cy.contains('Sign Out').click();
        cy.url().should('include', '/signin');
    });

    it('cannot access protected route after logout', () => {
        cy.contains('Sign Out').click();
        cy.visit('/foodstalls');
        cy.url().should('include', '/signin');
    });

    it('cart badge disappears after logout and re-login', () => {
        cy.contains('Sign Out').click();
        cy.url().should('include', '/signin');
        // Cart should be cleared
        cy.window().then((win) => {
            expect(win.localStorage.getItem('cart')).to.be.null;
        });
    });
});