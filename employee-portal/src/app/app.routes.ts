import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'employees',
    pathMatch: 'full',
  },
  {
    path: 'employees',
    loadComponent: () =>
      import('@fe-cryptolog-wave/feature-list').then((m) => m.FeatureList),
  },
  {
    path: 'departments',
    loadComponent: () =>
      import('@fe-cryptolog-wave/feature-department').then(
        (m) => m.FeatureDepartment
      ),
  },
  {
    path: 'employees/new',
    loadComponent: () =>
      import('@fe-cryptolog-wave/feature-detail').then((m) => m.FeatureDetail),
  },
  {
    path: 'employees/:id',
    loadComponent: () =>
      import('@fe-cryptolog-wave/feature-detail').then((m) => m.FeatureDetail),
  },
  {
    path: 'employees/:id/edit',
    loadComponent: () =>
      import('@fe-cryptolog-wave/feature-detail').then((m) => m.FeatureDetail),
  },
];
