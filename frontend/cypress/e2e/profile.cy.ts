describe('Profile', () => {
  it('US-PRO-01: User can view profile', () => {
    cy.loginAsUser();
    cy.visit('/profile');

    cy.contains('Profile Details');
  });
});
