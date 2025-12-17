describe('Reservation and Feedback Flow (E2E)', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('customer@test.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/profile');
  });

  it('should create a reservation', () => {
    cy.visit('/reservations');

    cy.get('input[name="date"]').type('2025-12-25');
    cy.get('input[name="time"]').type('19:00');
    cy.get('input[name="numOfGuests"]').type('4');

    cy.get('button[type="submit"]').click(); // or contains('Reserve')

    cy.contains('created successfully').should('be.visible'); // adjust to your toast message
  });
});