describe('Navigation', () => {
  it('US-NAV-01: Navbar links work', () => {
    cy.visit('/');

    cy.contains('Menu').click();
    cy.url().should('include', '/menu');

    cy.contains('Login').click();
    cy.url().should('include', '/login');
  });
});
