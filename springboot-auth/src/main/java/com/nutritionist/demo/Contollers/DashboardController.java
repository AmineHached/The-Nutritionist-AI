package com.nutritionist.demo.Contollers;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;

import com.nutritionist.demo.Entities.User;
import com.nutritionist.demo.Entities.History;
import com.nutritionist.demo.Repositories.UserRepository;
import com.nutritionist.demo.Repositories.HistoryRepository;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HistoryRepository historyRepository;

    // Type pour les données de calories par jour
    public static class DayCalories {
        public String date;
        public int calories;

        public DayCalories(String date, int calories) {
            this.date = date;
            this.calories = calories;
        }
    }

    // Type pour les calories par repas
    public static class CaloriesByMeal {
        public String meal;
        public int calories;

        public CaloriesByMeal(String meal, int calories) {
            this.meal = meal;
            this.calories = calories;
        }
    }

    // Type pour les calories par score
    public static class CaloriesByScore {
        public String score;
        public int calories;

        public CaloriesByScore(String score, int calories) {
            this.score = score;
            this.calories = calories;
        }
    }

    // Type pour les aliments malsains
    public static class UnhealthyFoodRow {
        public String food;
        public int occurrences;
        public int calories;
        public int carbs;
        public int fat;
        public int protein;
        public int sodium;
        public int sugar;

        public UnhealthyFoodRow(String food, int occurrences, int calories, int carbs, int fat, int protein, int sodium, int sugar) {
            this.food = food;
            this.occurrences = occurrences;
            this.calories = calories;
            this.carbs = carbs;
            this.fat = fat;
            this.protein = protein;
            this.sodium = sodium;
            this.sugar = sugar;
        }
    }

    // Type pour la relation entre repas
    public static class MealRelationshipPoint {
        public String meal;
        public int calories;
        public int carbs;

        public MealRelationshipPoint(String meal, int calories, int carbs) {
            this.meal = meal;
            this.calories = calories;
            this.carbs = carbs;
        }
    }

    /**
     * Retourne les calories quotidiennes de la semaine passée pour un utilisateur
     * @param email L'email de l'utilisateur
     */
    @GetMapping("/daily-calories/{email}")
    public List<DayCalories> getDailyCalories(@PathVariable String email) {
        Optional<User> optUser = userRepository.findByEmail(email);
        if (optUser.isEmpty()) return Collections.emptyList();

        User user = optUser.get();
        List<History> histories = historyRepository.findByUser(user);

        // Prepare last 7 days map
        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        Map<LocalDate, Integer> map = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            map.put(d, 0);
        }

        for (History h : histories) {
            if (h.getCreatedAt() == null || h.getCalories() == null) continue;
            LocalDate date = h.getCreatedAt().toLocalDate();
            if (map.containsKey(date)) {
                map.put(date, map.get(date) + h.getCalories().intValue());
            }
        }

        return map.entrySet().stream()
                .map(e -> new DayCalories(e.getKey().toString(), e.getValue()))
                .collect(Collectors.toList());
    }

    /**
     * Retourne les calories par type de repas pour un utilisateur
     * @param email L'email de l'utilisateur
     */
    @GetMapping("/calories-by-meal/{email}")
    public List<CaloriesByMeal> getCaloriesByMeal(@PathVariable String email) {
        Optional<User> optUser = userRepository.findByEmail(email);
        if (optUser.isEmpty()) return Collections.emptyList();
        User user = optUser.get();
        List<History> histories = historyRepository.findByUser(user);

        Map<String, Integer> byMeal = new HashMap<>();
        for (History h : histories) {
            String meal = h.getAction() == null ? "Unknown" : h.getAction();
            int cal = h.getCalories() == null ? 0 : h.getCalories().intValue();
            byMeal.put(meal, byMeal.getOrDefault(meal, 0) + cal);
        }
        return byMeal.entrySet().stream()
                .map(e -> new CaloriesByMeal(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    /**
     * Retourne les calories par score alimentaire pour un utilisateur
     * @param email L'email de l'utilisateur
     */
    @GetMapping("/calories-by-score/{email}")
    public List<CaloriesByScore> getCaloriesByScore(@PathVariable String email) {
        Optional<User> optUser = userRepository.findByEmail(email);
        if (optUser.isEmpty()) return Collections.emptyList();
        User user = optUser.get();
        List<History> histories = historyRepository.findByUser(user);

        int healthy = 0, neutral = 0, unhealthy = 0;
        for (History h : histories) {
            int cal = h.getCalories() == null ? 0 : h.getCalories().intValue();
            if (cal >= 700) unhealthy += cal;
            else if (cal >= 400) neutral += cal;
            else healthy += cal;
        }
        List<CaloriesByScore> out = new ArrayList<>();
        out.add(new CaloriesByScore("Unhealthy", unhealthy));
        out.add(new CaloriesByScore("Neutral", neutral));
        out.add(new CaloriesByScore("Healthy", healthy));
        return out;
    }

    /**
     * Retourne les aliments malsains les plus consommés pour un utilisateur
     * @param email L'email de l'utilisateur
     */
    @GetMapping("/top-unhealthy-foods/{email}")
    public List<UnhealthyFoodRow> getTopUnhealthyFoods(@PathVariable String email) {
        Optional<User> optUser = userRepository.findByEmail(email);
        if (optUser.isEmpty()) return Collections.emptyList();
        User user = optUser.get();
        List<History> histories = historyRepository.findByUser(user);

        Map<String, Integer> occurrences = new HashMap<>();
        Map<String, Integer> caloriesSum = new HashMap<>();

        for (History h : histories) {
            if (h.getFoodItems() == null) continue;
            String[] items = h.getFoodItems().split(",");
            int calPer = (h.getCalories() == null || items.length == 0) ? 0 : h.getCalories().intValue() / items.length;
            for (String it : items) {
                String food = it.trim().toLowerCase();
                if (food.isEmpty()) continue;
                occurrences.put(food, occurrences.getOrDefault(food, 0) + 1);
                caloriesSum.put(food, caloriesSum.getOrDefault(food, 0) + calPer);
            }
        }

        return occurrences.entrySet().stream()
                .sorted((a,b) -> Integer.compare(b.getValue(), a.getValue()))
                .limit(10)
                .map(e -> new UnhealthyFoodRow(
                        e.getKey(),
                        e.getValue(),
                        caloriesSum.getOrDefault(e.getKey(),0),
                        0,0,0,0,0))
                .collect(Collectors.toList());
    }

    /**
     * Retourne la relation entre repas (calories et glucides) pour un utilisateur
     * @param email L'email de l'utilisateur
     */
    @GetMapping("/meal-relationship/{email}")
    public List<MealRelationshipPoint> getMealRelationship(@PathVariable String email) {
        Optional<User> optUser = userRepository.findByEmail(email);
        if (optUser.isEmpty()) return Collections.emptyList();
        User user = optUser.get();
        List<History> histories = historyRepository.findByUser(user);

        Map<String, int[]> map = new HashMap<>(); // meal -> [calSum, carbSum]
        for (History h : histories) {
            String meal = h.getAction() == null ? "Unknown" : h.getAction();
            int cal = h.getCalories() == null ? 0 : h.getCalories().intValue();
            int carbs = h.getCarbs() == null ? 0 : h.getCarbs().intValue();
            int[] arr = map.getOrDefault(meal, new int[]{0,0});
            arr[0] += cal;
            arr[1] += carbs;
            map.put(meal, arr);
        }
        return map.entrySet().stream()
                .map(e -> new MealRelationshipPoint(e.getKey(), e.getValue()[0], e.getValue()[1]))
                .collect(Collectors.toList());
    }

    /**
     * Test endpoint
     */
    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "Dashboard API is running");
        response.put("timestamp", new java.util.Date().toString());
        return response;
    }
}
