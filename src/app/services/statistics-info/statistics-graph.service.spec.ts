import { TestBed } from '@angular/core/testing';

import { StatisticsGraphService } from './statistics-graph.service';

describe('StatisticsGraphService', () => {
  let service: StatisticsGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatisticsGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
