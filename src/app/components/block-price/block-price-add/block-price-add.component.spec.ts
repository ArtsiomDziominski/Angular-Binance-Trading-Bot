import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockPriceAddComponent } from './block-price-add.component';

describe('BlockPriceAddComponent', () => {
  let component: BlockPriceAddComponent;
  let fixture: ComponentFixture<BlockPriceAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlockPriceAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockPriceAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
