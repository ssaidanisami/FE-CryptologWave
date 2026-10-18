import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
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
  UpdateDepartmentDto,
} from '@fe-cryptolog-wave/data-access';
import {
  ConfirmationSelectorComponent,
  LanguageSelectorComponent,
} from '@fe-cryptolog-wave/shared-ui';
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
    ConfirmationSelectorComponent,
  ],
  templateUrl: './feature-department.html',
  styleUrl: './feature-department.scss',
})
export class FeatureDepartment implements OnInit {
  private readonly departmentService = inject(DepartmentService);
  private readonly translationService = inject(TranslationService);
  private readonly fb = inject(FormBuilder);

  private readonly confirmation = viewChild.required(ConfirmationSelectorComponent);

  departments = signal<Department[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  editingDepartment = signal<Department | null>(null);
  deletingId = signal<string | number | null>(null);

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

    const name = (this.departmentForm.value.name as string).trim();
    const editing = this.editingDepartment();

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (editing) {
      const payload: UpdateDepartmentDto = { name };
      this.departmentService.updateDepartment(editing.id, payload).subscribe({
        next: (updated) => {
          this.departments.update((list) =>
            list.map((d) =>
              d.id === editing.id
                ? { ...d, ...(updated ?? {}), name: updated?.name ?? name }
                : d
            )
          );
          this.successMessage.set(
            this.translationService.translate('department.updateSuccess', {
              name,
            })
          );
          this.cancelEdit();
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            err?.message ||
              this.translationService.translate('department.errors.updateFailed')
          );
          this.isSubmitting.set(false);
        },
      });
      return;
    }

    const payload: CreateDepartmentDto = { name };

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
    this.departmentForm.reset({ name: this.editingDepartment()?.name ?? '' });
  }

  startEdit(department: Department): void {
    this.editingDepartment.set(department);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.departmentForm.reset({ name: department.name });
  }

  cancelEdit(): void {
    this.editingDepartment.set(null);
    this.departmentForm.reset({ name: '' });
  }

  confirmDelete(event: Event, department: Department): void {
    this.confirmation()
      .confirm(event, {
        messageKey: 'department.confirmDelete',
        messageParams: { name: department.name },
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.deleteDepartment(department);
        }
      });
  }

  deleteDepartment(department: Department): void {
    this.deletingId.set(department.id);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.departmentService.deleteDepartment(department.id).subscribe({
      next: () => {
        this.departments.update((list) =>
          list.filter((d) => d.id !== department.id)
        );
        if (this.editingDepartment()?.id === department.id) {
          this.cancelEdit();
        }
        this.successMessage.set(
          this.translationService.translate('department.deleteSuccess', {
            name: department.name,
          })
        );
        this.deletingId.set(null);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.message ||
            this.translationService.translate('department.errors.deleteFailed')
        );
        this.deletingId.set(null);
      },
    });
  }
}
