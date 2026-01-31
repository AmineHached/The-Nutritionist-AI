package com.nutritionist.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DashboardData {
    private List<DayCalories> daily;
    private List<CaloriesByMeal> caloriesByMeal;
    private List<CaloriesByScore> caloriesByScore;
    private List<UnhealthyFoodRow> topUnhealthyFoods;
    private List<MealRelationshipPoint> mealRelationship;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class DayCalories {
        private String date;
        private int calories;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class CaloriesByMeal {
        private String meal;
        private int calories;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class CaloriesByScore {
        private String score;
        private int calories;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class UnhealthyFoodRow {
        private String food;
        private int occurrences;
        private int calories;
        private int carbs;
        private int fat;
        private int protein;
        private int sodium;
        private int sugar;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class MealRelationshipPoint {
        private String meal;
        private int calories;
        private int carbs;
    }
}
