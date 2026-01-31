import { Component, Input, OnChanges, Inject } from '@angular/core';
import { NgIf, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-meal-relationship-chart',
  standalone: true,
  imports: [BaseChartDirective, NgIf],
  templateUrl: './meal-relationship-chart.html',
  styleUrl: './meal-relationship-chart.scss',
})
export class MealRelationshipChartComponent implements OnChanges {
  @Input() data: { meal: string; calories: number; carbs: number }[] = [];
  isBrowser = false;

  scatterData: ChartConfiguration<'scatter'>['data'] = {
    datasets: [
      {
        label: 'Meals',
        data: [],
        pointRadius: 6,
      },
    ],
  };

  scatterOptions: ChartConfiguration<'scatter'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false, labels: { color: '#111827' } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const raw: any = ctx.raw;
            // raw: {x,y,meal}
            return `${raw.meal}: ${raw.x} kcal, ${raw.y} g carbs`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Calories (kcal)', color: '#0F172A', font: { size: 14, weight: 600 } },
        ticks: { color: '#0F172A', font: { size: 13 } },
        beginAtZero: true,
      },
      y: {
        title: { display: true, text: 'Carbs (g)', color: '#0F172A', font: { size: 14, weight: 600 } },
        ticks: { color: '#0F172A', font: { size: 13 } },
        beginAtZero: true,
      },
    },
  };

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(): void {
    const points = this.data.map((m) => ({
      x: m.calories,
      y: m.carbs,
      meal: m.meal,
    }));

    this.scatterData = {
      datasets: [
        {
          label: 'Meals',
          data: points as any,
          pointRadius: 7,
          pointBackgroundColor: '#59A14F',
          pointBorderColor: '#4E79A7',
          pointBorderWidth: 2,
        },
      ],
    };
  }
}
