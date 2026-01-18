import { Component, Input, OnChanges, Inject } from '@angular/core';
import { NgIf, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-calories-by-meal-chart',
  standalone: true,
  imports: [BaseChartDirective, NgIf],
  templateUrl: './calories-by-meal-chart.html',
  styleUrl: './calories-by-meal-chart.scss',
})
export class CaloriesByMealChartComponent implements OnChanges {
  @Input() data: { meal: string; calories: number }[] = [];
  isBrowser = false;

  barData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Calories (kcal)' }],
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false, labels: { color: '#0F172A' } } },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Calories (kcal)', color: '#0F172A', font: { size: 14, weight: 600 } }, ticks: { color: '#0F172A', font: { size: 13 } }, grid: { color: 'rgba(15,23,42,0.04)' } },
      x: { title: { display: true, text: 'Meal', color: '#0F172A', font: { size: 14, weight: 600 } }, ticks: { color: '#0F172A', font: { size: 13 } }, grid: { color: 'rgba(15,23,42,0.02)' } },
    },
  };

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(): void {
    this.barData = {
      labels: this.data.map(x => x.meal),
      datasets: [
        {
          data: this.data.map(x => x.calories),
          label: 'Calories (kcal)',
          backgroundColor: 'rgba(78,121,167,0.9)',
          borderColor: 'rgba(62,106,136,0.9)',
          borderWidth: 0,
          borderRadius: 8,
        },
      ],
    };
  }
}
