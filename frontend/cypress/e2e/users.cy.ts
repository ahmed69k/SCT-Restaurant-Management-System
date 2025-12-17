describe('Users Management', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/users');
  });

  it('US-USER-01: Admin sees users table', () => {
    cy.contains('Users Management');
    cy.get('table').should('exist');
  });

  it('US-USER-02: Admin opens edit user modal', () => {
    cy.contains('Edit').first().click();
    cy.get('.modal').should('exist');
  });
});
