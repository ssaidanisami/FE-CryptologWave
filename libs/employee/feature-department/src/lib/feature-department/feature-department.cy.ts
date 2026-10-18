import { TestBed } from '@angular/core/testing';
import { FeatureDepartment } from './feature-department';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import {
  DepartmentService,
  Department,
  CreateDepartmentDto,
} from '@fe-cryptolog-wave/data-access';
import { TranslationService } from '@fe-cryptolog-wave/shared-utils';
import { of, throwError } from 'rxjs';

describe('FeatureDepartment Component Tests', () => {
  const mockDepartments: Department[] = [
    { id: '1', name: 'Engineering' },
    { id: '2', name: 'Marketing' },
  ];

  let mockDepartmentService: Partial<DepartmentService>;

  const configure = () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        providePrimeNG({ theme: { preset: Aura } }),
        TranslationService,
        { provide: DepartmentService, useValue: mockDepartmentService },
      ],
    });
  };

  beforeEach(() => {
    cy.viewport('macbook-13');

    mockDepartmentService = {
      getDepartments: () => of(mockDepartments),
      createDepartment: (dto: CreateDepartmentDto) =>
        of({ id: '3', name: dto.name }),
    };
  });

  it('renders department list with data successfully', () => {
    configure();

    cy.mount(FeatureDepartment);

    cy.contains('Departments').should('be.visible');
    cy.get('p-table').should('be.visible');
    cy.get('p-table tbody tr').should('have.length', 2);
    cy.contains('Engineering').should('be.visible');
    cy.contains('Marketing').should('be.visible');
  });

  it('renders empty state when no departments exist', () => {
    mockDepartmentService.getDepartments = () => of([]);
    configure();

    cy.mount(FeatureDepartment);

    cy.contains('No departments found.').should('be.visible');
  });

  it('renders error message when loading departments fails', () => {
    mockDepartmentService.getDepartments = () =>
      throwError(() => new Error('Server connection error'));
    configure();

    cy.mount(FeatureDepartment);

    cy.contains('Server connection error').should('be.visible');
  });

  it('shows validation error when submitting an empty form', () => {
    configure();

    cy.mount(FeatureDepartment);

    cy.contains('button', 'Create Department').click();
    cy.contains('Department name is required.').should('be.visible');
    cy.get('p-table tbody tr').should('have.length', 2);
  });

  it('creates a department and adds it to the list', () => {
    const createSpy = cy
      .stub()
      .callsFake((dto: CreateDepartmentDto) => of({ id: '3', name: dto.name }));
    mockDepartmentService.createDepartment = createSpy;
    configure();

    cy.mount(FeatureDepartment);

    cy.get('#departmentName').type('Finance');
    cy.contains('button', 'Create Department').click();

    cy.wrap(createSpy).should('have.been.calledWith', { name: 'Finance' });
    cy.get('p-table tbody tr').should('have.length', 3);
    cy.contains('Finance').should('be.visible');
    cy.contains('Department "Finance" created successfully.').should(
      'be.visible'
    );
    cy.get('#departmentName').should('have.value', '');
  });

  it('shows error message when creation fails', () => {
    mockDepartmentService.createDepartment = () =>
      throwError(() => new Error('Department already exists'));
    configure();

    cy.mount(FeatureDepartment);

    cy.get('#departmentName').type('Engineering');
    cy.contains('button', 'Create Department').click();

    cy.contains('Department already exists').should('be.visible');
    cy.get('p-table tbody tr').should('have.length', 2);
  });

  it('renders PrimeNG paginator', () => {
    configure();

    cy.mount(FeatureDepartment);

    cy.get('.p-paginator').should('be.visible');
  });
});
