describe('Auth', () => {
  it('US-AUTH-01: User can register', () => {
    cy.visit('/register');

    cy.get('#name').type('Test User');
    cy.get('#email').type('test@test.com');
    cy.get('#password').type('123456');
    cy.get('#role').select('User');

    cy.contains('Register').click();
  });

  it('US-AUTH-02: User can login', () => {
    cy.visit('/login');

    cy.get('#email').type('test@test.com');
    cy.get('#password').type('123456');

    cy.contains('Sign In').click();
  });
});
