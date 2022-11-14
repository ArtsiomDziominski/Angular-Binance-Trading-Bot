import { TestBed } from '@angular/core/testing';

import { WalletBscService } from './wallet-bsc.service';

describe('WalletEthService', () => {
  let service: WalletBscService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalletBscService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
