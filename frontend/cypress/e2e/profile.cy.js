describe('Profile Page - JWT Auth', () => {
    beforeEach(() => {
        cy.window().then((win) => {
            win.localStorage.setItem('user', JSON.stringify({
                id: 1,
                name: 'Test User',
                email: 'user@example.com',
                phone: '1234567890',
            }));
            win.localStorage.setItem('token', 'mock-jwt-token-123');
        });
        cy.visit('/profile');
    });

    it('renders the profile page', () => {
        cy.contains('My Profile').should('be.visible');
    });

    it('displays user name from localStorage', () => {
        cy.contains('Test User').should('be.visible');
    });

    it('displays user email from localStorage', () => {
        cy.contains('user@example.com').should('be.visible');
    });

    it('shows Profile active in navbar', () => {
        cy.get('.nav-icon-btn.active-route').should('contain', 'Profile');
    });

    it('shows Edit Profile button', () => {
        cy.contains('Edit Profile').should('be.visible');
    });

    it('shows edit form when Edit Profile is clicked', () => {
        cy.contains('Edit Profile').click();
        cy.contains('Save').should('be.visible');
        cy.contains('Cancel').should('be.visible');
    });

    it('shows validation error for invalid email', () => {
        cy.contains('Edit Profile').click();
        cy.get('input').first().clear().type('Test User');
        // Clear email and type bad value
        cy.get('input').eq(1).clear().type('bademail');
        cy.contains('Save').click();
        cy.contains('Invalid email format').should('be.visible');
    });

    it('cancels editing and restores original values', () => {
        cy.contains('Edit Profile').click();
        cy.contains('Cancel').click();
        cy.contains('Test User').should('be.visible');
    });

    it('shows Change Password button', () => {
        cy.contains('Change Password').should('be.visible');
    });

    it('shows password form when Change Password is clicked', () => {
        cy.contains('Change Password').click();
        cy.get('input[placeholder="Enter current password"]').should('be.visible');
        cy.get('input[placeholder="Enter new password"]').should('be.visible');
    });
});