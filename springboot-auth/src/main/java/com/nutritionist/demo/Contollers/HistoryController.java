package com.nutritionist.demo.Contollers;

import com.nutritionist.demo.Entities.History;
import com.nutritionist.demo.Entities.User;
import com.nutritionist.demo.Iservices.IHistoryService;
import com.nutritionist.demo.Iservices.IUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final IHistoryService historyService;
    private final IUserService userService;

    public HistoryController(IHistoryService historyService, IUserService userService) {
        this.historyService = historyService;
        this.userService = userService;
    }

    // Sauvegarder un historique
    @PostMapping("/save")
    public ResponseEntity<History> saveHistory(@RequestBody History history) {
        System.out.println("[HistoryController] POST /api/history/save called");
        if (history != null) {
            System.out.println("[HistoryController] incoming history item: action=" + history.getAction() + ", calories=" + history.getCalories() + ", foodItems=" + history.getFoodItems());
        }
        // Vérifie si l'utilisateur existe
        String email = null;
        if (history.getUser() != null) {
            email = history.getUser().getEmail();
        }

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Optional<User> userOpt = userService.findByEmail(email);
        User user;
        if (userOpt.isEmpty()) {
            // Auto-create a minimal user to associate the history (dev convenience)
            String usernameCandidate = email.split("@")[0];
            if (usernameCandidate.length() < 3) {
                usernameCandidate = usernameCandidate + "user";
            }
            // Ensure password meets validation (min length)
            String randomPassword = UUID.randomUUID().toString().replaceAll("-", "");
            if (randomPassword.length() < 8) randomPassword = randomPassword + "changeme";

            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(usernameCandidate);
            newUser.setPassword(randomPassword);
            try {
                user = userService.register(newUser);
            } catch (Exception ex) {
                ex.printStackTrace();
                return ResponseEntity.internalServerError().build();
            }
        } else {
            user = userOpt.get();
        }

        history.setUser(user);
        // Ensure createdAt is set (AI service may send ISO string that fails to bind)
        if (history.getCreatedAt() == null) {
            history.setCreatedAt(LocalDateTime.now());
        }
        if (history.getAction() == null || history.getAction().isBlank()) {
            history.setAction("Food Analysis");
        }
        History savedHistory = historyService.saveHistory(history);
        System.out.println("[HistoryController] history saved id=" + savedHistory.getId() + " for user=" + savedHistory.getUser().getEmail());
        return ResponseEntity.ok(savedHistory);
    }

    // Récupérer l'historique d'un utilisateur par email
    @GetMapping("/user/{email}")
    public ResponseEntity<List<History>> getHistoryByUser(@PathVariable String email) {
        Optional<User> user = userService.findByEmail(email);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<History> histories = historyService.getHistoryByUser(user.get());
        return ResponseEntity.ok(histories);
    }

    // Alternative: get history by email as query param (to avoid @ in path)
    @GetMapping("/by-email")
    public ResponseEntity<List<History>> getHistoryByEmail(@RequestParam String email) {
        Optional<User> user = userService.findByEmail(email);
        if (user.isEmpty()) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        List<History> histories = historyService.getHistoryByUser(user.get());
        // Ensure newest-first ordering if not already
        histories.sort((a,b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return ResponseEntity.ok(histories);
    }

    // Quick debug: recent history (global) newest first
    @GetMapping("/recent")
    public ResponseEntity<List<History>> getRecent(@RequestParam(defaultValue = "10") int limit) {
        List<History> recent = historyService.getRecent(limit);
        return ResponseEntity.ok(recent);
    }

    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Long id) {
        historyService.deleteHistory(id);
        return ResponseEntity.noContent().build();
    }

    
}
