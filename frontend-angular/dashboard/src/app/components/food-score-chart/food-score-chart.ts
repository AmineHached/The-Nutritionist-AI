import { Component, Input, OnChanges, Inject } from '@angular/core';
import { NgIf, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-food-score-chart',
  standalone: true,
  imports: [BaseChartDirective, NgIf],
  templateUrl: './food-score-chart.html',
  styleUrl: './food-score-chart.scss',
})
export class FoodScoreChartComponent implements OnChanges {
  @Input() data: { score: string; calories: number }[] = [];
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
      y: { beginAtZero: true, title: { display: true, text: 'Calories (kcal)', color: '#0F172A', font: { size: 14, weight: 600 } }, ticks: { color: '#0F172A', font: { size: 13 } }, grid: { color: 'rgba(15,23,42,0.06)' } },
      x: { title: { display: true, text: 'Food Score', color: '#0F172A', font: { size: 14, weight: 600 } }, ticks: { color: '#0F172A', font: { size: 13 } }, grid: { color: 'rgba(15,23,42,0.03)' } },
    },
  };

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(): void {
    this.barData = {
      labels: this.data.map(x => x.score),
      datasets: [
        {
          data: this.data.map(x => x.calories),
          label: 'Calories (kcal)',
          backgroundColor: 'rgba(89,161,79,0.82)',
          borderColor: '#4a9a3f',
          borderWidth: 1,
        },
      ],
    };
  }
}
