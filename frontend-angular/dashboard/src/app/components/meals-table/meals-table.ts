import { Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-meals-table',
  standalone: true,
  imports: [NgFor],
  templateUrl: './meals-table.html',
  styleUrl: './meals-table.scss',
})
export class MealsTableComponent {
  @Input() rows: any[] = [];
}
