import { TestBed } from '@angular/core/testing';
import { FeatureDetail } from './feature-detail';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { EmployeeService, Employee } from '@fe-cryptolog-wave/data-access';
import { of, throwError } from 'rxjs';

describe('FeatureDetail Component Tests', () => {
  const mockEmployee: Employee = {
    id: '123',
    name: 'Jane',
    lastName: 'Doe',
    department: 'Human Resources',
    salary: 72000,
  };

  let mockEmployeeService: Partial<EmployeeService>;
  let mockRouter: Partial<Router>;

  beforeEach(() => {
    cy.viewport('macbook-13');

    mockEmployeeService = {
      getEmployeeById: (id: string | number) => of(mockEmployee),
      createEmployee: (dto: any) => of({ id: '124', ...dto }),
      updateEmployee: (id: string | number, dto: any) => of({ id, ...dto }),
      deleteEmployee: (id: string | number) => of(void 0),
    };

    mockRouter = {
      navigate: (commands: any[]) => Promise.resolve(true),
    };
  });

  describe('Create Mode', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: EmployeeService, useValue: mockEmployeeService },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                url: [{ path: 'new' }],
                paramMap: { get: () => null },
                routeConfig: { path: 'new' },
              },
            },
          },
        ],
      });
    });

    it('renders create employee form and allows submitting a valid employee', () => {
      cy.mount(FeatureDetail);

      cy.contains('Create New Employee').should('be.visible');
      cy.get('input#name').type('Carlos');
      cy.get('input#lastName').type('Santana');
      cy.get('input#salary').type('90000');
      cy.get('select#department').select('Engineering');

      cy.get('button[type="submit"]').contains('Create Employee').click();
    });

    it('shows validation error when fields are invalid', () => {
      cy.mount(FeatureDetail);

      cy.get('input#name').focus().blur();
      cy.contains('First name is required').should('be.visible');

      cy.get('button[type="submit"]').should('be.disabled');
    });
  });

  describe('View Mode', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: EmployeeService, useValue: mockEmployeeService },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                url: [{ path: '123' }],
                paramMap: { get: () => '123' },
                routeConfig: { path: ':id' },
              },
            },
          },
        ],
      });
    });

    it('renders employee detail cards with accurate information', () => {
      cy.mount(FeatureDetail);

      cy.contains('Jane Doe').should('be.visible');
      cy.contains('Human Resources').should('be.visible');
      cy.contains('#123').should('be.visible');
      cy.contains('$72,000.00').should('be.visible');
      cy.get('button').contains('Edit').should('be.visible');
      cy.get('button').contains('Delete').should('be.visible');
    });

    it('handles delete action with confirmation', () => {
      cy.stub(window, 'confirm').returns(true);

      cy.mount(FeatureDetail);

      cy.get('button').contains('Delete').click();
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: EmployeeService, useValue: mockEmployeeService },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                url: [{ path: '123' }, { path: 'edit' }],
                paramMap: { get: () => '123' },
                routeConfig: { path: ':id/edit' },
              },
            },
          },
        ],
      });
    });

    it('pre-populates form with employee data in edit mode and allows update', () => {
      cy.mount(FeatureDetail);

      cy.contains('Edit Employee').should('be.visible');
      cy.get('input#name').should('have.value', 'Jane');
      cy.get('input#lastName').should('have.value', 'Doe');
      cy.get('input#salary').should('have.value', '72000');
      cy.get('select#department').should('have.value', 'Human Resources');

      cy.get('input#name').clear().type('Janet');
      cy.get('button[type="submit"]').contains('Update Employee').click();
    });
  });

  describe('Error State', () => {
    it('displays error message when employee loading fails', () => {
      mockEmployeeService.getEmployeeById = () =>
        throwError(() => new Error('Employee not found'));

      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: EmployeeService, useValue: mockEmployeeService },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                url: [{ path: '999' }],
                paramMap: { get: () => '999' },
                routeConfig: { path: ':id' },
              },
            },
          },
        ],
      });

      cy.mount(FeatureDetail);

      cy.contains('Employee not found').should('be.visible');
    });
  });
});
