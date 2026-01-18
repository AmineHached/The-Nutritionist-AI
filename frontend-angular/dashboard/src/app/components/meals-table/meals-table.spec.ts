import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealsTable } from './meals-table';

describe('MealsTable', () => {
  let component: MealsTable;
  let fixture: ComponentFixture<MealsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
