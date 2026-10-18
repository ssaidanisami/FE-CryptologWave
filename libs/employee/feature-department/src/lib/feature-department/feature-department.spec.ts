import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FeatureDepartment } from './feature-department';
import { DepartmentService, Department } from '@fe-cryptolog-wave/data-access';
import { TranslationService } from '@fe-cryptolog-wave/shared-utils';

describe('FeatureDepartment', () => {
  let component: FeatureDepartment;
  let fixture: ComponentFixture<FeatureDepartment>;
  let mockDepartmentService: {
    getDepartments: ReturnType<typeof vi.fn>;
    createDepartment: ReturnType<typeof vi.fn>;
  };
  let translationService: TranslationService;

  const sampleDepartments: Department[] = [
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'Marketing' },
  ];

  beforeEach(async () => {
    mockDepartmentService = {
      getDepartments: vi.fn().mockReturnValue(of(sampleDepartments)),
      createDepartment: vi
        .fn()
        .mockImplementation((dto: { name: string }) =>
          of({ id: 3, name: dto.name })
        ),
    };

    await TestBed.configureTestingModule({
      imports: [FeatureDepartment],
      providers: [
        provideRouter([]),
        { provide: DepartmentService, useValue: mockDepartmentService },
      ],
    }).compileComponents();

    translationService = TestBed.inject(TranslationService);
    fixture = TestBed.createComponent(FeatureDepartment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load departments on init', () => {
    expect(component).toBeTruthy();
    expect(mockDepartmentService.getDepartments).toHaveBeenCalled();
    expect(component.departments()).toEqual(sampleDepartments);
    expect(component.isLoading()).toBeFalsy();
  });

  it('should handle error when loading departments fails', () => {
    mockDepartmentService.getDepartments.mockReturnValue(
      throwError(() => new Error('Server error'))
    );

    component.loadDepartments();

    expect(component.errorMessage()).toBe('Server error');
    expect(component.isLoading()).toBeFalsy();
  });

  it('should render translated elements in English and French', () => {
    translationService.setLanguage('en');
    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Departments');

    translationService.setLanguage('fr');
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Départements');
  });

  it('should not submit when the form is invalid', () => {
    component.onSubmit();

    expect(mockDepartmentService.createDepartment).not.toHaveBeenCalled();
    expect(component.nameControl.touched).toBe(true);
  });

  it('should create a department and append it to the list', () => {
    translationService.setLanguage('en');
    component.nameControl.setValue('  Finance  ');

    component.onSubmit();

    expect(mockDepartmentService.createDepartment).toHaveBeenCalledWith({
      name: 'Finance',
    });
    expect(component.departments().length).toBe(3);
    expect(component.departments()[2]).toEqual({ id: 3, name: 'Finance' });
    expect(component.successMessage()).toBe(
      'Department "Finance" created successfully.'
    );
    expect(component.nameControl.value).toBe('');
    expect(component.isSubmitting()).toBeFalsy();
  });

  it('should handle error when creation fails', () => {
    mockDepartmentService.createDepartment.mockReturnValue(
      throwError(() => new Error('Department already exists'))
    );
    component.nameControl.setValue('Engineering');

    component.onSubmit();

    expect(component.errorMessage()).toBe('Department already exists');
    expect(component.departments().length).toBe(2);
    expect(component.isSubmitting()).toBeFalsy();
  });

  it('should reset the form', () => {
    component.nameControl.setValue('Something');
    component.onReset();
    expect(component.nameControl.value).toBe('');
  });
});
