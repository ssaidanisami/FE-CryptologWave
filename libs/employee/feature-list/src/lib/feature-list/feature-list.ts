import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { EmployeeService, Employee } from '@fe-cryptolog-wave/data-access';
import {
  ConfirmationSelectorComponent,
  LanguageSelectorComponent,
} from '@fe-cryptolog-wave/shared-ui';
import { TranslatePipe, TranslationService } from '@fe-cryptolog-wave/shared-utils';

@Component({
  selector: 'lib-feature-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    TableModule,
    TranslatePipe,
    LanguageSelectorComponent,
    ConfirmationSelectorComponent,
  ],
  templateUrl: './feature-list.html',
  styleUrl: './feature-list.scss',
})
export class FeatureList implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);

  private readonly confirmation = viewChild.required(ConfirmationSelectorComponent);

  employees = signal<Employee[]>([]);
  isLoading = signal<boolean>(false);
  isExportingPdf = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  deletingId = signal<string | number | null>(null);
  first = signal<number>(0);
  rows = signal<number>(10);

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

  onPageChange(event: { first?: number; rows?: number }): void {
    if (event.first !== undefined) {
      this.first.set(event.first);
    }
    if (event.rows !== undefined) {
      this.rows.set(event.rows);
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/employees/new']);
  }

  exportPdf(): void {
    this.isExportingPdf.set(true);
    this.errorMessage.set(null);

    const pageSize = this.rows() || 10;
    const pageIndex = Math.floor(this.first() / pageSize);

    this.employeeService.getEmployeesPdfReport(pageIndex, pageSize).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'employees-report.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
        this.isExportingPdf.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.message || this.translationService.translate('employee.list.errors.exportFailed')
        );
        this.isExportingPdf.set(false);
      },
    });
  }

  navigateToEdit(id: string | number): void {
    this.router.navigate(['/employees', id, 'edit']);
  }

  navigateToDetail(id: string | number): void {
    this.router.navigate(['/employees', id]);
  }

  confirmDelete(event: Event, employee: Employee): void {
    this.confirmation()
      .confirm(event, {
        messageKey: 'employee.list.confirmDelete',
        messageParams: { name: employee.name, lastName: employee.lastName },
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.deleteEmployee(employee);
        }
      });
  }

  deleteEmployee(employee: Employee): void {
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
