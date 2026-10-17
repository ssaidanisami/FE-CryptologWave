import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { EmployeeService, Employee } from '@fe-cryptolog-wave/data-access';
import { TranslatePipe, TranslationService } from '@fe-cryptolog-wave/shared-utils';

@Component({
  selector: 'lib-feature-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TableModule, TranslatePipe],
  templateUrl: './feature-list.html',
  styleUrl: './feature-list.css',
})
export class FeatureList implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);

  employees = signal<Employee[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  deletingId = signal<string | number | null>(null);

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees.set(data ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.message || this.translationService.translate('employee.list.errors.loadFailed')
        );
        this.isLoading.set(false);
      },
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/employees/new']);
  }

  navigateToEdit(id: string | number): void {
    this.router.navigate(['/employees', id, 'edit']);
  }

  navigateToDetail(id: string | number): void {
    this.router.navigate(['/employees', id]);
  }

  deleteEmployee(employee: Employee): void {
    const confirmMessage = this.translationService.translate(
      'employee.list.confirmDelete',
      { name: employee.name, lastName: employee.lastName }
    );
    const confirmed = confirm(confirmMessage);
    if (!confirmed) {
      return;
    }

    this.deletingId.set(employee.id);
    this.employeeService.deleteEmployee(employee.id).subscribe({
      next: () => {
        this.employees.update((list) => list.filter((e) => e.id !== employee.id));
        this.deletingId.set(null);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.message || this.translationService.translate('employee.list.errors.deleteFailed')
        );
        this.deletingId.set(null);
      },
    });
  }
}
