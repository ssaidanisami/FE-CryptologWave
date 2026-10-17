import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';
import { Employee, CreateEmployeeDto } from './employee.model';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;

  const mockEmployees: Employee[] = [
    { id: 1, name: 'John', lastName: 'Doe', salary: 75000, department: 'Engineering' },
    { id: 2, name: 'Jane', lastName: 'Smith', salary: 82000, department: 'Marketing' },
  ];

  const apiUrl = 'http://localhost:8082/api/v1/employees';

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all employees as direct array', () => {
    service.getEmployees().subscribe((employees) => {
      expect(employees.length).toBe(2);
      expect(employees).toEqual(mockEmployees);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockEmployees);
  });

  it('should pass pagination params to getEmployees', () => {
    service.getEmployees(1, 5).subscribe((employees) => {
      expect(employees).toEqual(mockEmployees);
    });

    const req = httpMock.expectOne(`${apiUrl}?page=1&size=5`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEmployees);
  });

  it('should fetch paginated employees with getEmployeesPage', () => {
    const pageResponse = {
      content: mockEmployees,
      totalElements: 12,
      totalPages: 3,
      size: 5,
      number: 1,
    };

    service.getEmployeesPage({ page: 1, size: 5, sort: 'name,asc' }).subscribe((res) => {
      expect(res.content).toEqual(mockEmployees);
      expect(res.totalElements).toBe(12);
      expect(res.totalPages).toBe(3);
      expect(res.number).toBe(1);
      expect(res.size).toBe(5);
    });

    const req = httpMock.expectOne((r) => r.url === apiUrl && r.params.get('page') === '1' && r.params.get('size') === '5' && r.params.get('sort') === 'name,asc');
    expect(req.request.method).toBe('GET');
    req.flush(pageResponse);
  });

  it('should format array response properly with getEmployeesPage', () => {
    service.getEmployeesPage({ page: 0, size: 10 }).subscribe((res) => {
      expect(res.content).toEqual(mockEmployees);
      expect(res.totalElements).toBe(2);
      expect(res.totalPages).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}?page=0&size=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEmployees);
  });

  it('should fetch employees when backend returns paginated PageResponse (content property)', () => {
    const paginatedResponse = {
      content: mockEmployees,
      totalElements: 2,
      totalPages: 1,
      size: 10,
      number: 0,
    };

    service.getEmployees().subscribe((employees) => {
      expect(employees.length).toBe(2);
      expect(employees).toEqual(mockEmployees);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(paginatedResponse);
  });

  it('should handle empty paginated content gracefully', () => {
    const emptyPage = {
      content: [],
      totalElements: 0,
      totalPages: 0,
    };

    service.getEmployees().subscribe((employees) => {
      expect(employees).toEqual([]);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(emptyPage);
  });

  it('should fetch employee by id', () => {
    service.getEmployeeById(1).subscribe((employee) => {
      expect(employee).toEqual(mockEmployees[0]);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEmployees[0]);
  });

  it('should create employee', () => {
    const newEmp: CreateEmployeeDto = {
      name: 'Alice',
      lastName: 'Wonder',
      salary: 60000,
      department: 'HR',
    };
    const createdEmp: Employee = { id: 3, ...newEmp };

    service.createEmployee(newEmp).subscribe((res) => {
      expect(res).toEqual(createdEmp);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newEmp);
    req.flush(createdEmp);
  });

  it('should update employee', () => {
    const updateDto = { salary: 90000 };
    const updatedEmp: Employee = { ...mockEmployees[0], salary: 90000 };

    service.updateEmployee(1, updateDto).subscribe((res) => {
      expect(res).toEqual(updatedEmp);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateDto);
    req.flush(updatedEmp);
  });

  it('should delete employee', () => {
    service.deleteEmployee(1).subscribe((res) => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
