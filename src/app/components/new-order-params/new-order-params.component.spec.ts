import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewOrderParamsComponent } from './new-order-params.component';

describe('NewOrderParamsComponent', () => {
  let component: NewOrderParamsComponent;
  let fixture: ComponentFixture<NewOrderParamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewOrderParamsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewOrderParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
