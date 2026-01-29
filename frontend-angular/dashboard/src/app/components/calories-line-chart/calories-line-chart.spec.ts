import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaloriesLineChartComponent } from './calories-line-chart';

describe('CaloriesLineChart', () => {
  let component: CaloriesLineChartComponent;
  let fixture: ComponentFixture<CaloriesLineChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaloriesLineChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaloriesLineChartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
