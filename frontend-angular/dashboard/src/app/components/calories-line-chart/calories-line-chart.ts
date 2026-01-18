import { Component, Input, OnChanges, Inject } from '@angular/core';
import { NgIf, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

export type DayCalories = { date: string; calories: number };

// Project palette (see dashboard.scss :root)
const PRIMARY = '#4E79A7';
const PRIMARY_FILL = 'rgba(78,121,167,0.14)';
const ALERT = '#E15759';
const GRID_Y = 'rgba(15,23,42,0.06)';
const GRID_X = 'rgba(15,23,42,0.03)';
const TEXT = '#0F172A';

@Component({
  selector: 'app-calories-line-chart',
  standalone: true,
  imports: [BaseChartDirective, NgIf],
  templateUrl: './calories-line-chart.html',
  styleUrl: './calories-line-chart.scss',
})
export class CaloriesLineChartComponent implements OnChanges {
  @Input() daily: DayCalories[] = [];
  @Input() goal = 2500;

  isBrowser = false;

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: TEXT,
          boxWidth: 28,
          boxHeight: 10,
          font: { size: 14, weight: 600 },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(17,24,39,0.92)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        displayColors: true,
      },
    },
    scales: {
      y: {
        suggestedMin: 0,
        suggestedMax: 3000,
        title: {
          display: true,
          text: 'Calories (kcal)',
          color: TEXT,
          font: { size: 15, weight: 600 },
        },
        ticks: { color: TEXT, font: { size: 13 } },
        grid: { color: GRID_Y },
      },
      x: {
        title: { display: true, text: 'Date', color: TEXT, font: { size: 14, weight: 600 } },
        ticks: { color: TEXT, font: { size: 13 } },
        grid: { color: GRID_X },
      },
    },
  };

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(): void {
    const labels = this.daily.map((d) => d.date);
    const calories = this.daily.map((d) => d.calories);
    const goalLine = this.daily.map(() => this.goal);

    this.lineChartData = {
      labels,
      datasets: [
        {
          data: calories,
          label: 'Calories',
          borderColor: PRIMARY,
          backgroundColor: PRIMARY_FILL,
          fill: 'start',
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: PRIMARY,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        },
        {
          data: goalLine,
          label: 'Goal',
          borderColor: ALERT,
          borderDash: [6, 6],
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    };
  }
}
