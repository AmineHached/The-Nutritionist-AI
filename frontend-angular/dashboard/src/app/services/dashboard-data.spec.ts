import { TestBed } from '@angular/core/testing';

import { DashboardData } from './dashboard-data';

describe('DashboardData', () => {
  let service: DashboardData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
