describe('Login Flow (E2E)', () => {
  it('should login as customer', () => {
    cy.visit('/login');

    cy.get('input[name="email"]').type('customer@test.com'); // replace with your test email
    cy.get('input[name="password"]').type('password123');

    cy.get('button[type="submit"]').click(); // or cy.get('button').contains('Login').click();

    cy.url().should('include', '/profile');
    cy.contains('Profile').should('be.visible'); // or any text after login
  });

  it('should login as admin and see admin links', () => {
    cy.visit('/login');

    cy.get('input[name="email"]').type('admin@test.com');
    cy.get('input[name="password"]').type('admin123');

    cy.get('button[type="submit"]').click();

    cy.contains('Users').should('be.visible');
    cy.contains('Tables').should('be.visible');
    cy.contains('Feedbacks').should('be.visible');
  });
});