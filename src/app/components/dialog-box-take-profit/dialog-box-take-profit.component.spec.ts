import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogBoxTakeProfitComponent } from './dialog-box-take-profit.component';

describe('DialogBoxTakeProfitComponent', () => {
  let component: DialogBoxTakeProfitComponent;
  let fixture: ComponentFixture<DialogBoxTakeProfitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogBoxTakeProfitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogBoxTakeProfitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
