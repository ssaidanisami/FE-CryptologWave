import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import {
  DepartmentService,
  Department,
  CreateDepartmentDto,
} from '@fe-cryptolog-wave/data-access';
import { LanguageSelectorComponent } from '@fe-cryptolog-wave/shared-ui';
import { TranslatePipe, TranslationService } from '@fe-cryptolog-wave/shared-utils';

@Component({
  selector: 'lib-feature-department',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    TranslatePipe,
    LanguageSelectorComponent,
  ],
  templateUrl: './feature-department.html',
  styleUrl: './feature-department.scss',
})
export class FeatureDepartment implements OnInit {
  private readonly departmentService = inject(DepartmentService);
  private readonly translationService = inject(TranslationService);
  private readonly fb = inject(FormBuilder);

  departments = signal<Department[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  departmentForm: FormGroup = this.fb.group({
    name: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
  });

  ngOnInit(): void {
    this.loadDepartments();
  }

  get nameControl(): FormControl {
    return this.departmentForm.get('name') as FormControl;
  }

  loadDepartments(forceRefresh = false): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.departmentService.getDepartments(forceRefresh).subscribe({
      next: (data) => {
        this.departments.set(data ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.message ||
            this.translationService.translate('department.errors.loadFailed')
        );
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    const payload: CreateDepartmentDto = {
      name: (this.departmentForm.value.name as string).trim(),
    };

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.departmentService.createDepartment(payload).subscribe({
      next: (created) => {
        this.departments.update((list) => [
          ...list,
          created ?? { id: payload.name, name: payload.name },
        ]);
        this.successMessage.set(
          this.translationService.translate('department.createSuccess', {
            name: payload.name,
          })
        );
        this.departmentForm.reset({ name: '' });
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.message ||
            this.translationService.translate('department.errors.createFailed')
        );
        this.isSubmitting.set(false);
      },
    });
  }

  onReset(): void {
    this.departmentForm.reset({ name: '' });
  }
}
