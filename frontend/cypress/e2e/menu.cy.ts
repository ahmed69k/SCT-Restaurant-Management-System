describe('Menu', () => {
  it('US-MENU-01: User can view menu', () => {
    cy.visit('/menu');
    cy.get('.menu-card').should('exist');
  });

  it('US-MENU-02: Admin can add menu item', () => {
    cy.loginAsAdmin();
    cy.visit('/menu');

    cy.contains('Add Menu Item').click();
    cy.get('.modal').should('exist');
  });
});
