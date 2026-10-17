import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  PageResponse,
  PaginationParams,
} from './employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8082/api/v1/employees';

  getEmployees(page?: number, size?: number): Observable<Employee[]> {
    let params = new HttpParams();
    if (page !== undefined && page !== null) {
      params = params.set('page', page.toString());
    }
    if (size !== undefined && size !== null) {
      params = params.set('size', size.toString());
    }

    return this.http
      .get<Employee[] | PageResponse<Employee>>(this.apiUrl, { params })
      .pipe(
        map((response) => (Array.isArray(response) ? response : response.content ?? [])),
        catchError(this.handleError)
      );
  }

  getEmployeesPage(
    params?: PaginationParams
  ): Observable<PageResponse<Employee>> {
    let httpParams = new HttpParams();
    if (params?.page !== undefined && params.page !== null) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.size !== undefined && params.size !== null) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    if (params?.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    return this.http
      .get<Employee[] | PageResponse<Employee>>(this.apiUrl, { params: httpParams })
      .pipe(
        map((response) => {
          if (Array.isArray(response)) {
            return {
              content: response,
              totalElements: response.length,
              totalPages: response.length > 0 ? 1 : 0,
              size: params?.size ?? response.length,
              number: params?.page ?? 0,
            };
          }
          return {
            content: response.content ?? [],
            totalElements: response.totalElements ?? response.content?.length ?? 0,
            totalPages: response.totalPages ?? 1,
            size: response.size ?? params?.size ?? 10,
            number: response.number ?? params?.page ?? 0,
          };
        }),
        catchError(this.handleError)
      );
  }

  getEmployeeById(id: string | number): Observable<Employee> {
    return this.http
      .get<Employee>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createEmployee(employee: CreateEmployeeDto): Observable<Employee> {
    return this.http
      .post<Employee>(this.apiUrl, employee)
      .pipe(catchError(this.handleError));
  }

  updateEmployee(
    id: string | number,
    employee: UpdateEmployeeDto,
  ): Observable<Employee> {
    return this.http
      .put<Employee>(`${this.apiUrl}/${id}`, employee)
      .pipe(catchError(this.handleError));
  }

  deleteEmployee(id: string | number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
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
