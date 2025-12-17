describe('Reservations', () => {
  it('US-RES-01: User can create reservation', () => {
    cy.loginAsUser();
    cy.visit('/reservations');

    cy.get('input[type="date"]').type('2030-12-30');
    cy.get('input[type="time"]').type('19:00');
    cy.get('input[type="number"]').type('2');

    cy.contains('Confirm Reservation').click();
  });
});
