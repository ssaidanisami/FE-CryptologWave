import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, shareReplay, tap, throwError } from 'rxjs';
import {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from './department.model';
import { PageResponse } from './employee.model';

type DepartmentsApiResponse =
  | Department[]
  | string[]
  | PageResponse<Department>
  | PageResponse<string>;

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8082/api/v1/departments';

  private departments$: Observable<Department[]> | null = null;

  /**
   * Fetches the list of departments. The result is cached and shared between
   * subscribers since departments are reference data that rarely change.
   * Pass `forceRefresh = true` to bypass the cache.
   */
  getDepartments(forceRefresh = false): Observable<Department[]> {
    if (!this.departments$ || forceRefresh) {
      this.departments$ = this.http
        .get<DepartmentsApiResponse>(this.apiUrl)
        .pipe(
          map((response) => this.normalize(response)),
          catchError((error: HttpErrorResponse) => {
            this.departments$ = null;
            return this.handleError(error);
          }),
          shareReplay({ bufferSize: 1, refCount: false })
        );
    }
    return this.departments$;
  }

  getDepartmentNames(forceRefresh = false): Observable<string[]> {
    return this.getDepartments(forceRefresh).pipe(
      map((departments) => departments.map((d) => d.name))
    );
  }

  createDepartment(department: CreateDepartmentDto): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, department).pipe(
      tap(() => this.invalidateCache()),
      catchError(this.handleError)
    );
  }

  updateDepartment(
    id: string | number,
    department: UpdateDepartmentDto
  ): Observable<Department> {
    return this.http
      .put<Department>(`${this.apiUrl}/${id}`, department)
      .pipe(
        tap(() => this.invalidateCache()),
        catchError(this.handleError)
      );
  }

  deleteDepartment(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.invalidateCache()),
      catchError(this.handleError)
    );
  }

  invalidateCache(): void {
    this.departments$ = null;
  }

  private normalize(response: DepartmentsApiResponse): Department[] {
    const items: Array<Department | string> = Array.isArray(response)
      ? response
      : response?.content ?? [];

    return items.map((item) =>
      typeof item === 'string' ? { id: item, name: item } : item
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    } else if (typeof error.error === 'string') {
      errorMessage = error.error;
    }
    return throwError(() => new Error(errorMessage));
  }
}
