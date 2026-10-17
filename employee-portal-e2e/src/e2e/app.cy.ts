import { getGreeting } from '../support/app.po';

describe('employee-portal-e2e', () => {
  beforeEach(() => cy.visit('/'));

  it('should display employee management title', () => {
    getGreeting().contains(/Employee Management/);
  });
});
