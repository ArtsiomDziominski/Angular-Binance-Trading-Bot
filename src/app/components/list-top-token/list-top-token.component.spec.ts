import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTopTokenComponent } from './list-top-token.component';

describe('ListTopTokenComponent', () => {
  let component: ListTopTokenComponent;
  let fixture: ComponentFixture<ListTopTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListTopTokenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTopTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
