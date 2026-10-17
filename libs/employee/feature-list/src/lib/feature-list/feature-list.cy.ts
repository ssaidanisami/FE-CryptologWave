import { TestBed } from '@angular/core/testing';
import { FeatureList } from './feature-list';
import { provideRouter, Router } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { EmployeeService, Employee } from '@fe-cryptolog-wave/data-access';
import { TranslationService } from '@fe-cryptolog-wave/shared-utils';
import { of, throwError } from 'rxjs';

describe('FeatureList Component Tests', () => {
  const mockEmployees: Employee[] = [
    {
      id: '1',
      name: 'Alice',
      lastName: 'Smith',
      department: 'Engineering',
      salary: 85000,
    },
    {
      id: '2',
      name: 'Bob',
      lastName: 'Johnson',
      department: 'Marketing',
      salary: 65000,
    },
  ];

  let mockEmployeeService: Partial<EmployeeService>;

  beforeEach(() => {
    cy.viewport('macbook-13');

    mockEmployeeService = {
      getEmployees: () => of(mockEmployees),
      deleteEmployee: (id: string | number) => of(void 0),
    };
  });

  it('renders employee table with data successfully', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        providePrimeNG({ theme: { preset: Aura } }),
        TranslationService,
        { provide: EmployeeService, useValue: mockEmployeeService },
      ],
    });

    cy.mount(FeatureList);

    cy.contains('Employee Directory').should('be.visible');
    cy.get('p-table').should('be.visible');
    cy.get('p-table tbody tr').should('have.length', 2);
    cy.contains('Alice Smith').should('be.visible');
    cy.contains('Bob Johnson').should('be.visible');
    cy.contains('Engineering').should('be.visible');
    cy.contains('Marketing').should('be.visible');
  });

  it('renders empty state when no employees exist', () => {
    mockEmployeeService.getEmployees = () => of([]);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        providePrimeNG({ theme: { preset: Aura } }),
        TranslationService,
        { provide: EmployeeService, useValue: mockEmployeeService },
      ],
    });

    cy.mount(FeatureList);

    cy.contains('No employees found.').should('be.visible');
    cy.contains('Add the first employee').should('be.visible');
  });

  it('renders error message when loading employees fails', () => {
    mockEmployeeService.getEmployees = () =>
      throwError(() => new Error('Server connection error'));

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        providePrimeNG({ theme: { preset: Aura } }),
        TranslationService,
        { provide: EmployeeService, useValue: mockEmployeeService },
      ],
    });

    cy.mount(FeatureList);

    cy.contains('Server connection error').should('be.visible');
  });

  it('navigates when clicking + Add Employee button', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        providePrimeNG({ theme: { preset: Aura } }),
        TranslationService,
        { provide: EmployeeService, useValue: mockEmployeeService },
      ],
    });

    cy.mount(FeatureList).then(() => {
      const router = TestBed.inject(Router);
      cy.stub(router, 'navigate').resolves(true).as('navigateSpy');
    });

    cy.contains('button', 'Add Employee').click();
    cy.get('@navigateSpy').should('have.been.calledWith', ['/employees/new']);
  });

  it('handles employee deletion with confirmation', () => {
    cy.stub(window, 'confirm').returns(true);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        providePrimeNG({ theme: { preset: Aura } }),
        TranslationService,
        { provide: EmployeeService, useValue: mockEmployeeService },
      ],
    });

    cy.mount(FeatureList);

    cy.get('p-table tbody tr').should('have.length', 2);
    cy.get('p-table tbody tr').first().contains('Delete').click();
    cy.get('p-table tbody tr').should('have.length', 1);
    cy.contains('Alice Smith').should('not.exist');
    cy.contains('Bob Johnson').should('be.visible');
  });

  it('renders PrimeNG paginator', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        providePrimeNG({ theme: { preset: Aura } }),
        TranslationService,
        { provide: EmployeeService, useValue: mockEmployeeService },
      ],
    });

    cy.mount(FeatureList);

    cy.get('.p-paginator').should('be.visible');
  });
});
