package com.nutritionist.demo.Contollers;

import com.nutritionist.demo.Services.CoachService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/coach")
@CrossOrigin(origins = "http://localhost:4200")
public class CoachController {

    private final CoachService coachService;

    public CoachController(CoachService coachService) {
        this.coachService = coachService;
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendChat(@RequestBody ChatRequest request) {
        Map<String, Object> response = coachService.sendChat(request.getEmail(), request.getMessage(), request.getSessionId());
        return ResponseEntity.ok(response);
    }

    @Data
    public static class ChatRequest {
        private String email;
        private String message;
        private Long sessionId;
    }
}
