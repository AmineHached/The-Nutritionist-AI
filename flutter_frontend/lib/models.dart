import 'dart:convert';

class MacroNutrients {
  final double caloriesKcal;
  final double proteinG;
  final double carbsG;
  final double fatG;
  final double sugarG;
  final double fiberG;

  MacroNutrients({
    required this.caloriesKcal,
    required this.proteinG,
    required this.carbsG,
    required this.fatG,
    required this.sugarG,
    required this.fiberG,
  });

  factory MacroNutrients.fromJson(Map<String, dynamic> j) => MacroNutrients(
        caloriesKcal: (j['calories_kcal'] ?? 0).toDouble(),
        proteinG: (j['protein_g'] ?? 0).toDouble(),
        carbsG: (j['carbs_g'] ?? 0).toDouble(),
        fatG: (j['fat_g'] ?? 0).toDouble(),
        sugarG: (j['sugar_g'] ?? 0).toDouble(),
        fiberG: (j['fiber_g'] ?? 0).toDouble(),
      );
}

class FoodItem {
  final String name;
  final double confidence;
  final String portionDesc;
  final double? weightG;
  final MacroNutrients nutrition;
  final String? healthRating;

  FoodItem({
    required this.name,
    required this.confidence,
    required this.portionDesc,
    this.weightG,
    required this.nutrition,
    this.healthRating,
  });

  factory FoodItem.fromJson(Map<String, dynamic> j) => FoodItem(
        name: j['name'] ?? '',
        confidence: (j['confidence'] ?? 0).toDouble(),
        portionDesc: j['portion_desc'] ?? '',
        weightG: j['weight_g'] != null ? (j['weight_g']).toDouble() : null,
        nutrition: MacroNutrients.fromJson(j['nutrition'] ?? {}),
        healthRating: j['health_rating'],
      );
}

class AnalysisResponse {
  final List<FoodItem> foodItems;
  final MacroNutrients totalNutrition;
  final int healthScore;
  final String healthSummary;
  final List<String> recommendations;
  final List<String> warnings;

  AnalysisResponse({
    required this.foodItems,
    required this.totalNutrition,
    required this.healthScore,
    required this.healthSummary,
    required this.recommendations,
    required this.warnings,
  });

  factory AnalysisResponse.fromJson(Map<String, dynamic> j) => AnalysisResponse(
        foodItems: (j['food_items'] as List<dynamic>? ?? []).map((e) => FoodItem.fromJson(e)).toList(),
        totalNutrition: MacroNutrients.fromJson(j['total_nutrition'] ?? {}),
        healthScore: (j['health_score'] ?? 0).toInt(),
        healthSummary: j['health_summary'] ?? '',
        recommendations: List<String>.from(j['recommendations'] ?? []),
        warnings: List<String>.from(j['warnings'] ?? []),
      );

  Map<String, dynamic> toJson() => {
        'food_items': foodItems.map((f) => {
              'name': f.name,
              'confidence': f.confidence,
              'portion_desc': f.portionDesc,
            }).toList(),
        'total_nutrition': {
          'calories_kcal': totalNutrition.caloriesKcal,
        },
        'health_score': healthScore,
        'health_summary': healthSummary,
        'recommendations': recommendations,
        'warnings': warnings,
      };
}

String prettyPrintJson(Map m) => const JsonEncoder.withIndent('  ').convert(m);
