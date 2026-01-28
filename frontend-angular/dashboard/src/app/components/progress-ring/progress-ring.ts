import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-progress-ring',
  standalone: true,
  templateUrl: './progress-ring.html',
  styleUrls: ['./progress-ring.scss'],
})
export class ProgressRingComponent implements OnChanges {
  /** percentage: 0-100 */
  @Input() percentage = 0;
  @Input() size = 120; // px

  // computed visual params
  stroke = 12; // px (actual pixel thickness)
  strokeNorm = 10; // stroke in viewBox (0-100) units
  radius = 45; // viewBox units
  circumference = 2 * Math.PI * this.radius;
  dashOffset = 0;
  textSize = 36; // px for centered percentage

  ngOnChanges(): void {
    // compute stroke based on requested size (thinner default)
    this.stroke = Math.max(6, Math.round(this.size * 0.09));
    // convert to viewBox units (viewBox is 100x100)
    this.strokeNorm = (this.stroke / this.size) * 100;
    // radius is half of viewBox (50) minus half the stroke
    this.radius = 50 - this.strokeNorm / 2;
    this.circumference = 2 * Math.PI * this.radius;

    const pct = Math.max(0, Math.min(100, Math.round(this.percentage)));
    this.dashOffset = this.circumference * (1 - pct / 100);

    // text scales proportionally but stays legible; make less bold/smaller to fit center
    this.textSize = Math.max(18, Math.round(this.size * 0.26));
  }
}