import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaloriesByMealChart } from './calories-by-meal-chart';

describe('CaloriesByMealChart', () => {
  let component: CaloriesByMealChart;
  let fixture: ComponentFixture<CaloriesByMealChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaloriesByMealChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaloriesByMealChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
