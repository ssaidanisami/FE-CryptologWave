import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {
  EmployeeService,
  Employee,
  CreateEmployeeDto,
} from '@fe-cryptolog-wave/data-access';
import { EmployeeFormComponent } from '@fe-cryptolog-wave/ui';
import { LanguageSelectorComponent } from '@fe-cryptolog-wave/shared-ui';
import { TranslatePipe, TranslationService } from '@fe-cryptolog-wave/shared-utils';

export type FeatureDetailMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'lib-feature-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    EmployeeFormComponent,
    LanguageSelectorComponent,
    TranslatePipe,
  ],
  templateUrl: './feature-detail.html',
  styleUrl: './feature-detail.css',
})
export class FeatureDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly translationService = inject(TranslationService);

  mode = signal<FeatureDetailMode>('view');
  employeeId = signal<string | number | null>(null);
  employee = signal<Employee | null>(null);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const routeSnapshot = this.route.snapshot;
    const urlSegments = routeSnapshot.url.map((segment) => segment.path);

    if (urlSegments.includes('new') || routeSnapshot.routeConfig?.path === 'new') {
      this.mode.set('create');
      return;
    }

    const id = routeSnapshot.paramMap.get('id');
    if (id) {
      this.employeeId.set(id);
      if (urlSegments.includes('edit')) {
        this.mode.set('edit');
      } else {
        this.mode.set('view');
      }
      this.loadEmployee(id);
    }
  }

  loadEmployee(id: string | number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.employeeService.getEmployeeById(id).subscribe({
      next: (data) => {
        this.employee.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.message || this.translationService.translate('employee.detail.errors.loadFailed')
        );
        this.isLoading.set(false);
      },
    });
  }

  switchToEdit(): void {
    if (this.employeeId()) {
      this.router.navigate(['/employees', this.employeeId(), 'edit']);
      this.mode.set('edit');
    }
  }

  onFormSubmit(dto: CreateEmployeeDto): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    if (this.mode() === 'create') {
      this.employeeService.createEmployee(dto).subscribe({
        next: (created) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/employees', created.id]);
        },
        error: (err) => {
          this.errorMessage.set(
            err?.message || this.translationService.translate('employee.detail.errors.createFailed')
          );
          this.isSubmitting.set(false);
        },
      });
    } else if (this.mode() === 'edit' && this.employeeId()) {
      this.employeeService.updateEmployee(this.employeeId()!, dto).subscribe({
        next: (updated) => {
          this.isSubmitting.set(false);
          this.employee.set(updated);
          this.router.navigate(['/employees', updated.id]);
        },
        error: (err) => {
          this.errorMessage.set(
            err?.message || this.translationService.translate('employee.detail.errors.updateFailed')
          );
          this.isSubmitting.set(false);
        },
      });
    }
  }

  onCancel(): void {
    if (this.mode() === 'edit' && this.employeeId()) {
      this.router.navigate(['/employees', this.employeeId()]);
    } else {
      this.router.navigate(['/employees']);
    }
  }

  deleteCurrentEmployee(): void {
    const current = this.employee();
    if (!current) return;

    const confirmed = confirm(
      this.translationService.translate('employee.detail.confirmDelete', {
        name: current.name,
        lastName: current.lastName,
      })
    );
    if (!confirmed) return;

    this.isSubmitting.set(true);
    this.employeeService.deleteEmployee(current.id).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.message || this.translationService.translate('employee.detail.errors.deleteFailed')
        );
        this.isSubmitting.set(false);
      },
    });
  }
}
