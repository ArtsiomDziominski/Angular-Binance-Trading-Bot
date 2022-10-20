import { TestBed } from '@angular/core/testing';

import { FunctionsOrderService } from './functions-order.service';

describe('FunctionsOrderService', () => {
  let service: FunctionsOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FunctionsOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
