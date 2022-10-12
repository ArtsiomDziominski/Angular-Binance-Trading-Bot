import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiBoxComponent } from './api-box.component';

describe('ApiBoxComponent', () => {
  let component: ApiBoxComponent;
  let fixture: ComponentFixture<ApiBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApiBoxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
