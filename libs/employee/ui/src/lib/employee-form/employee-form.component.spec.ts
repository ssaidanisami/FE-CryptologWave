import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeFormComponent } from './employee-form.component';
import { Employee } from '@fe-cryptolog-wave/data-access';

describe('EmployeeFormComponent', () => {
  let component: EmployeeFormComponent;
  let fixture: ComponentFixture<EmployeeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize an invalid form by default', () => {
    expect(component).toBeTruthy();
    expect(component.employeeForm.valid).toBeFalsy();
  });

  it('should validate required fields', () => {
    const name = component.nameControl;
    const lastName = component.lastNameControl;
    const salary = component.salaryControl;
    const department = component.departmentControl;

    expect(name?.valid).toBeFalsy();
    expect(name?.errors?.['required']).toBeTruthy();

    expect(lastName?.valid).toBeFalsy();
    expect(lastName?.errors?.['required']).toBeTruthy();

    expect(salary?.valid).toBeFalsy();
    expect(salary?.errors?.['required']).toBeTruthy();

    expect(department?.valid).toBeFalsy();
    expect(department?.errors?.['required']).toBeTruthy();
  });

  it('should validate minlength and salary min constraints', () => {
    component.employeeForm.patchValue({
      name: 'A',
      lastName: 'B',
      salary: 0,
      department: 'Engineering',
    });

    expect(component.nameControl?.errors?.['minlength']).toBeTruthy();
    expect(component.lastNameControl?.errors?.['minlength']).toBeTruthy();
    expect(component.salaryControl?.errors?.['min']).toBeTruthy();
  });

  it('should emit formSubmit with valid data on submit', () => {
    const submitSpy = vi.fn();
    component.formSubmit.subscribe(submitSpy);

    component.employeeForm.setValue({
      name: 'Jane',
      lastName: 'Doe',
      salary: 65000,
      department: 'Engineering',
    });

    component.onSubmit();

    expect(submitSpy).toHaveBeenCalledWith({
      name: 'Jane',
      lastName: 'Doe',
      salary: 65000,
      department: 'Engineering',
    });
  });

  it('should populate form when employee input is provided', () => {
    const employee: Employee = {
      id: 1,
      name: 'Alice',
      lastName: 'Smith',
      salary: 80000,
      department: 'Finance',
    };

    component.employee = employee;
    component.ngOnChanges({
      employee: {
        currentValue: employee,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false,
      },
    });

    expect(component.employeeForm.value).toEqual({
      name: 'Alice',
      lastName: 'Smith',
      salary: 80000,
      department: 'Finance',
    });
    expect(component.employeeForm.valid).toBeTruthy();
  });

  it('should emit formCancel when cancel is clicked', () => {
    const cancelSpy = vi.fn();
    component.formCancel.subscribe(cancelSpy);

    component.onCancel();

    expect(cancelSpy).toHaveBeenCalled();
  });
});
