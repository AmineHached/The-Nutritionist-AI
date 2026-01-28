import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealRelationshipChart } from './meal-relationship-chart';

describe('MealRelationshipChart', () => {
  let component: MealRelationshipChart;
  let fixture: ComponentFixture<MealRelationshipChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealRelationshipChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealRelationshipChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
