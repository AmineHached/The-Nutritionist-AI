import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Meals } from './meals';

describe('Meals', () => {
  let component: Meals;
  let fixture: ComponentFixture<Meals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Meals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Meals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
