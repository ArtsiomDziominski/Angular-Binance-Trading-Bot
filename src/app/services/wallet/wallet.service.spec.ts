import { TestBed } from '@angular/core/testing';

import { WalletAptosService } from './wallet-aptos.service';

describe('WalletService', () => {
  let service: WalletAptosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalletAptosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
