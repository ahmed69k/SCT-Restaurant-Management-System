describe('Feedback', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/feedbacks');
  });

  it('US-FB-01: Admin sees feedback table', () => {
    cy.contains('All Feedbacks');
    cy.get('table').should('exist');
  });
});
