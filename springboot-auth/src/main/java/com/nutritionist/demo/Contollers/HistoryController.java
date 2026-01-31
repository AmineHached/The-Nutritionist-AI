package com.nutritionist.demo.Contollers;

import com.nutritionist.demo.Entities.History;
import com.nutritionist.demo.Entities.User;
import com.nutritionist.demo.Iservices.IHistoryService;
import com.nutritionist.demo.Iservices.IUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

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
        // Vérifie si l'utilisateur existe
        Optional<User> user = userService.findByEmail(history.getUser().getEmail());
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().build(); // utilisateur inconnu
        }
        history.setUser(user.get()); // Associe l'utilisateur existant
        History savedHistory = historyService.saveHistory(history);
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

    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Long id) {
        historyService.deleteHistory(id);
        return ResponseEntity.noContent().build();
    }

    
}
