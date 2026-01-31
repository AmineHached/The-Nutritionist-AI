import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodScoreChart } from './food-score-chart';

describe('FoodScoreChart', () => {
  let component: FoodScoreChart;
  let fixture: ComponentFixture<FoodScoreChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodScoreChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoodScoreChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
