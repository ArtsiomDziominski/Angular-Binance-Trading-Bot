import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockPriceComponent } from './block-price.component';

describe('BlockPriceComponent', () => {
  let component: BlockPriceComponent;
  let fixture: ComponentFixture<BlockPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlockPriceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
