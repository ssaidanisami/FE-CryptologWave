import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FeatureList } from './feature-list';
import { EmployeeService, Employee } from '@fe-cryptolog-wave/data-access';
import { TranslationService } from '@fe-cryptolog-wave/shared-utils';

describe('FeatureList', () => {
  let component: FeatureList;
  let fixture: ComponentFixture<FeatureList>;
  let mockEmployeeService: {
    getEmployees: ReturnType<typeof vi.fn>;
    deleteEmployee: ReturnType<typeof vi.fn>;
    getEmployeesPdfReport: ReturnType<typeof vi.fn>;
  };
  let mockRouter: {
    navigate: ReturnType<typeof vi.fn>;
  };
  let translationService: TranslationService;

  const sampleEmployees: Employee[] = [
    { id: 1, name: 'John', lastName: 'Doe', salary: 60000, department: 'Engineering' },
    { id: 2, name: 'Jane', lastName: 'Doe', salary: 70000, department: 'Marketing' },
  ];

  beforeEach(async () => {
    mockEmployeeService = {
      getEmployees: vi.fn().mockReturnValue(of(sampleEmployees)),
      deleteEmployee: vi.fn().mockReturnValue(of(void 0)),
      getEmployeesPdfReport: vi.fn().mockReturnValue(of(new Blob(['test'], { type: 'application/pdf' }))),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FeatureList],
      providers: [
        { provide: EmployeeService, useValue: mockEmployeeService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } },
          },
        },
      ],
    }).compileComponents();

    translationService = TestBed.inject(TranslationService);
    fixture = TestBed.createComponent(FeatureList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load employees on init', () => {
    expect(component).toBeTruthy();
    expect(mockEmployeeService.getEmployees).toHaveBeenCalled();
    expect(component.employees()).toEqual(sampleEmployees);
    expect(component.isLoading()).toBeFalsy();
  });

  it('should handle error when loading employees fails', () => {
    mockEmployeeService.getEmployees.mockReturnValue(
      throwError(() => new Error('Server error'))
    );

    component.loadEmployees();

    expect(component.errorMessage()).toBe('Server error');
    expect(component.isLoading()).toBeFalsy();
  });

  it('should render translated elements in English and French', () => {
    translationService.setLanguage('en');
    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Employee Directory');
    expect(compiled.textContent).toContain('Add Employee');
    expect(compiled.textContent).toContain('Export PDF');

    translationService.setLanguage('fr');
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Annuaire des Employés');
    expect(compiled.textContent).toContain('Ajouter un Employé');
    expect(compiled.textContent).toContain('Exporter en PDF');
  });

  it('should navigate to create employee', () => {
    component.navigateToCreate();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees/new']);
  });

  it('should navigate to edit employee', () => {
    component.navigateToEdit(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees', 1, 'edit']);
  });

  it('should navigate to employee detail', () => {
    component.navigateToDetail(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees', 1]);
  });

  it('should handle empty response by setting empty array', () => {
    mockEmployeeService.getEmployees.mockReturnValue(of([]));

    component.loadEmployees();
    fixture.detectChanges();

    expect(component.employees()).toEqual([]);
  });

  it('should delete employee after confirmation with translated prompt', () => {
    const confirmSpy = vi.spyOn(component['confirmation'](), 'confirm').mockReturnValue(of(true));

    component.confirmDelete(new MouseEvent('click'), sampleEmployees[0]);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockEmployeeService.deleteEmployee).toHaveBeenCalledWith(1);
    expect(component.employees().length).toBe(1);
    expect(component.employees()[0].id).toBe(2);
  });

  it('should not delete employee if not confirmed', () => {
    const confirmSpy = vi.spyOn(component['confirmation'](), 'confirm').mockReturnValue(of(false));

    component.confirmDelete(new MouseEvent('click'), sampleEmployees[0]);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockEmployeeService.deleteEmployee).not.toHaveBeenCalled();
    expect(component.employees().length).toBe(2);
  });

  it('should generate and download pdf report with current page and size', () => {
    const mockBlob = new Blob(['%PDF-1.4...'], { type: 'application/pdf' });
    mockEmployeeService.getEmployeesPdfReport.mockReturnValue(of(mockBlob));

    const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:http://localhost/mock-url');
    const revokeObjectURLSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockReturnValue();

    component.onPageChange({ first: 10, rows: 5 });
    component.exportPdf();

    expect(mockEmployeeService.getEmployeesPdfReport).toHaveBeenCalledWith(2, 5);
    expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/mock-url');
    expect(component.isExportingPdf()).toBeFalsy();
  });

  it('should handle error when exporting pdf report fails', () => {
    mockEmployeeService.getEmployeesPdfReport.mockReturnValue(
      throwError(() => new Error('Export error'))
    );

    component.exportPdf();

    expect(component.errorMessage()).toBe('Export error');
    expect(component.isExportingPdf()).toBeFalsy();
  });
});
