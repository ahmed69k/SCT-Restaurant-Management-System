describe('Home Page (US-HOME)', () => {

  it('US-HOME-01: Home page loads correctly', () => {
    cy.visit('/home');

    cy.contains('The Golden Plate');
    cy.contains('View Our Menu');
    cy.contains('Book a Table');
  });

  it('US-HOME-02: Navigate to menu from home', () => {
    cy.contains('View Our Menu').click();
    cy.url().should('include', '/menu');
  });

});
