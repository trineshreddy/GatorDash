describe('Profile Flow', () => {
    beforeEach(() => {
        cy.window().then((win) => {
            win.localStorage.setItem('user', JSON.stringify({
                id: 1,
                name: 'Test User',
                email: 'user@example.com',
                phone: '1234567890',
            }));
        });
        cy.visit('/profile');
    });

    it('displays user info on profile page', () => {
        cy.contains('My Profile').should('be.visible');
        cy.contains('Test User').should('be.visible');
        cy.contains('user@example.com').should('be.visible');
    });

    it('clicking Edit Profile shows input fields', () => {
        cy.contains('Edit Profile').click();
        cy.get('.profile-input').should('have.length.greaterThan', 0);
        cy.contains('Save').should('be.visible');
        cy.contains('Cancel').should('be.visible');
    });

    it('can change name and save', () => {
        cy.contains('Edit Profile').click();
        cy.get('.profile-input').first().clear().type('Updated Name');
        cy.contains('Save').click();
        cy.contains('Updated Name').should('be.visible');
    });

    it('changes persist after page refresh', () => {
        cy.contains('Edit Profile').click();
        cy.get('.profile-input').first().clear().type('Persistent Name');
        cy.contains('Save').click();
        cy.reload();
        cy.contains('Persistent Name').should('be.visible');
    });

    it('cancel restores original values', () => {
        cy.contains('Edit Profile').click();
        cy.get('.profile-input').first().clear().type('Changed Name');
        cy.contains('Cancel').click();
        cy.contains('Test User').should('be.visible');
    });
});