import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DepartmentService } from './department.service';
import { Department } from './department.model';

describe('DepartmentService', () => {
  let service: DepartmentService;
  let httpMock: HttpTestingController;

  const mockDepartments: Department[] = [
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'Marketing' },
  ];

  const apiUrl = 'http://localhost:8082/api/v1/departments';

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        DepartmentService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DepartmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch departments as direct array', () => {
    service.getDepartments().subscribe((departments) => {
      expect(departments).toEqual(mockDepartments);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockDepartments);
  });

  it('should normalize paginated response', () => {
    service.getDepartments().subscribe((departments) => {
      expect(departments).toEqual(mockDepartments);
    });

    const req = httpMock.expectOne(apiUrl);
    req.flush({ content: mockDepartments, totalElements: 2 });
  });

  it('should normalize string array response', () => {
    service.getDepartments().subscribe((departments) => {
      expect(departments).toEqual([
        { id: 'Sales', name: 'Sales' },
        { id: 'Finance', name: 'Finance' },
      ]);
    });

    const req = httpMock.expectOne(apiUrl);
    req.flush(['Sales', 'Finance']);
  });

  it('should return department names', () => {
    service.getDepartmentNames().subscribe((names) => {
      expect(names).toEqual(['Engineering', 'Marketing']);
    });

    const req = httpMock.expectOne(apiUrl);
    req.flush(mockDepartments);
  });

  it('should cache departments between calls', () => {
    service.getDepartments().subscribe();
    service.getDepartments().subscribe((departments) => {
      expect(departments).toEqual(mockDepartments);
    });

    const req = httpMock.expectOne(apiUrl);
    req.flush(mockDepartments);
  });

  it('should refetch when forceRefresh is true', () => {
    service.getDepartments().subscribe();
    httpMock.expectOne(apiUrl).flush(mockDepartments);

    service.getDepartments(true).subscribe();
    httpMock.expectOne(apiUrl).flush(mockDepartments);
  });

  it('should not cache a failed request', () => {
    service.getDepartments().subscribe({
      error: (err) => expect(err.message).toContain('500'),
    });
    httpMock
      .expectOne(apiUrl)
      .flush('boom', { status: 500, statusText: 'Server Error' });

    service.getDepartments().subscribe((departments) => {
      expect(departments).toEqual(mockDepartments);
    });
    httpMock.expectOne(apiUrl).flush(mockDepartments);
  });

  it('should create department and invalidate cache', () => {
    service.getDepartments().subscribe();
    httpMock.expectOne(apiUrl).flush(mockDepartments);

    const created: Department = { id: 3, name: 'Operations' };
    service.createDepartment({ name: 'Operations' }).subscribe((res) => {
      expect(res).toEqual(created);
    });

    const postReq = httpMock.expectOne(apiUrl);
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual({ name: 'Operations' });
    postReq.flush(created);

    service.getDepartments().subscribe();
    httpMock.expectOne(apiUrl).flush([...mockDepartments, created]);
  });
});
