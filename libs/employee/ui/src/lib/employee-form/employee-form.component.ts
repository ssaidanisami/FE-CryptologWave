import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { Employee, CreateEmployeeDto } from '@fe-cryptolog-wave/data-access';
import { TranslatePipe } from '@fe-cryptolog-wave/shared-utils';

@Component({
  selector: 'lib-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, SelectModule, TranslatePipe],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
})
export class EmployeeFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() employee: Employee | null = null;
  @Input() isSubmitting = false;
  @Input() submitButtonText = 'Save Employee';

  @Output() formSubmit = new EventEmitter<CreateEmployeeDto>();
  @Output() formCancel = new EventEmitter<void>();

  employeeForm!: FormGroup;

  readonly departments = [
    'Engineering',
    'Human Resources',
    'Marketing',
    'Sales',
    'Finance',
    'Operations',
  ];

  ngOnInit(): void {
    this.initForm();
    if (this.employee) {
      this.populateForm(this.employee);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employee'] && this.employeeForm) {
      if (this.employee) {
        this.populateForm(this.employee);
      } else {
        this.employeeForm.reset();
      }
    }
  }

  private initForm(): void {
    this.employeeForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      salary: [
        null,
        [
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$'),
        ],
      ],
      department: ['', [Validators.required]],
    });
  }

  private populateForm(employee: Employee): void {
    this.employeeForm.patchValue({
      name: employee.name,
      lastName: employee.lastName,
      salary: employee.salary,
      department: employee.department,
    });
  }

  get nameControl(): FormControl {
    return this.employeeForm.get('name') as FormControl;
  }

  get lastNameControl(): FormControl {
    return this.employeeForm.get('lastName') as FormControl;
  }

  get salaryControl(): FormControl {
    return this.employeeForm.get('salary') as FormControl;
  }

  get departmentControl(): FormControl {
    return this.employeeForm.get('department') as FormControl;
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const formValue = this.employeeForm.value;
      const payload: CreateEmployeeDto = {
        name: formValue.name.trim(),
        lastName: formValue.lastName.trim(),
        salary: Number(formValue.salary),
        department: formValue.department,
      };
      this.formSubmit.emit(payload);
    } else {
      this.employeeForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
