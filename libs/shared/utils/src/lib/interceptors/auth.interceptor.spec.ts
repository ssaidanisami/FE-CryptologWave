import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { KeycloakService } from 'keycloak-angular';
import { vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let mockKeycloakService: Partial<KeycloakService>;

  beforeEach(() => {
    mockKeycloakService = {
      isLoggedIn: vi.fn().mockReturnValue(false),
      getKeycloakInstance: vi.fn().mockReturnValue({ token: undefined }),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: KeycloakService, useValue: mockKeycloakService },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should not add Authorization header if not logged in', () => {
    (mockKeycloakService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    );

    httpClient.get('/api/test').subscribe();

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should add Authorization header with Bearer token if logged in and token is present', () => {
    (mockKeycloakService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(
      true,
    );
    (
      mockKeycloakService.getKeycloakInstance as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      token: 'mock-jwt-token-12345',
    });

    httpClient.get('/api/test').subscribe();

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe(
      'Bearer mock-jwt-token-12345',
    );
    req.flush({});
  });
});
