describe('Tables Management (US-TABLE)', () => {

  it('US-TABLE-01: Admin views tables', () => {
    cy.visit('/tables');
    cy.contains('Tables List');
  });

  it('US-TABLE-02: Admin adds new table', () => {
    cy.contains('Add Table').click();

    cy.get('#seatingType').select('Table');
    cy.get('button[type="submit"]').click();
  });

});
