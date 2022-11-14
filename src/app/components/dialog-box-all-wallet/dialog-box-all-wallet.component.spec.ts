import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogBoxAllWalletComponent } from './dialog-box-all-wallet.component';

describe('DialogBoxAllWalletComponent', () => {
  let component: DialogBoxAllWalletComponent;
  let fixture: ComponentFixture<DialogBoxAllWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogBoxAllWalletComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogBoxAllWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
