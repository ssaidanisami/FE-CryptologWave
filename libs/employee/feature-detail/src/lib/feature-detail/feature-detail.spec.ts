import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FeatureDetail } from './feature-detail';
import {
  EmployeeService,
  Employee,
  CreateEmployeeDto,
} from '@fe-cryptolog-wave/data-access';
import { TranslationService } from '@fe-cryptolog-wave/shared-utils';

describe('FeatureDetail', () => {
  let component: FeatureDetail;
  let fixture: ComponentFixture<FeatureDetail>;
  let mockEmployeeService: any;
  let mockRouter: any;
  let activatedRouteStub: any;
  let translationService: TranslationService;

  const sampleEmployee: Employee = {
    id: 1,
    name: 'Alice',
    lastName: 'Smith',
    salary: 85000,
    department: 'Engineering',
  };

  beforeEach(async () => {
    mockEmployeeService = {
      getEmployeeById: vi.fn().mockReturnValue(of(sampleEmployee)),
      createEmployee: vi.fn().mockReturnValue(of({ ...sampleEmployee, id: 99 })),
      updateEmployee: vi.fn().mockReturnValue(of(sampleEmployee)),
      deleteEmployee: vi.fn().mockReturnValue(of(void 0)),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    activatedRouteStub = {
      snapshot: {
        url: [{ path: '1' }],
        paramMap: {
          get: (key: string) => (key === 'id' ? '1' : null),
        },
        routeConfig: { path: ':id' },
      },
    };

    await TestBed.configureTestingModule({
      imports: [FeatureDetail],
      providers: [
        { provide: EmployeeService, useValue: mockEmployeeService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    }).compileComponents();

    translationService = TestBed.inject(TranslationService);
    fixture = TestBed.createComponent(FeatureDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load and display employee in view mode', () => {
    expect(component).toBeTruthy();
    expect(component.mode()).toBe('view');
    expect(component.employee()).toEqual(sampleEmployee);
    expect(mockEmployeeService.getEmployeeById).toHaveBeenCalledWith('1');
  });

  it('should adapt "Create New Employee" title and form when language changes', () => {
    component.mode.set('create');
    translationService.setLanguage('en');
    fixture.detectChanges();

    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.card-title')?.textContent).toContain('Create New Employee');
    expect(compiled.querySelector('.back-link')?.textContent).toContain('Back to Employees');

    translationService.setLanguage('fr');
    fixture.detectChanges();

    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.card-title')?.textContent).toContain('Créer un Nouvel Employé');
    expect(compiled.querySelector('.back-link')?.textContent).toContain('Retour aux Employés');
  });

  it('should navigate to edit view on switchToEdit', () => {
    component.switchToEdit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees', '1', 'edit']);
    expect(component.mode()).toBe('edit');
  });

  it('should create employee when in create mode', () => {
    component.mode.set('create');
    const newDto: CreateEmployeeDto = {
      name: 'Bob',
      lastName: 'Marley',
      salary: 95000,
      department: 'Marketing',
    };

    component.onFormSubmit(newDto);

    expect(mockEmployeeService.createEmployee).toHaveBeenCalledWith(newDto);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees', 99]);
  });

  it('should update employee when in edit mode', () => {
    component.mode.set('edit');
    component.employeeId.set('1');
    const updateDto: CreateEmployeeDto = {
      name: 'Alice Updated',
      lastName: 'Smith',
      salary: 90000,
      department: 'Engineering',
    };

    component.onFormSubmit(updateDto);

    expect(mockEmployeeService.updateEmployee).toHaveBeenCalledWith('1', updateDto);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees', 1]);
  });

  it('should delete employee upon confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.deleteCurrentEmployee();

    expect(mockEmployeeService.deleteEmployee).toHaveBeenCalledWith(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees']);
  });

  it('should handle API errors properly', () => {
    mockEmployeeService.getEmployeeById.mockReturnValue(
      throwError(() => new Error('Not found'))
    );

    component.loadEmployee('999');

    expect(component.errorMessage()).toBe('Not found');
    expect(component.isLoading()).toBeFalsy();
  });
});
