package com.nutritionist.demo.Contollers;

import com.nutritionist.demo.Entities.ChatMessage;
import com.nutritionist.demo.Entities.ChatSession;
import com.nutritionist.demo.Services.ChatService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:4200")
public class ChatPersistenceController {

    private final ChatService chatService;

    public ChatPersistenceController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/session")
    public ResponseEntity<ChatSession> createSession(@RequestBody CreateSessionRequest request) {
        ChatSession session = chatService.createSession(request.getEmail(), request.getTitle());
        return ResponseEntity.ok(session);
    }

    @PostMapping("/message")
    public ResponseEntity<ChatMessage> addMessage(@RequestBody AddMessageRequest request) {
        ChatMessage message = chatService.addMessage(request.getSessionId(), request.getRole(), request.getContent());
        return ResponseEntity.ok(message);
    }
    
    @PutMapping("/session/{id}/title")
    public ResponseEntity<ChatSession> updateTitle(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        ChatSession session = chatService.updateSessionTitle(id, payload.get("title"));
        return ResponseEntity.ok(session);
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSession>> getUserSessions(@RequestParam String email) {
        return ResponseEntity.ok(chatService.getSessionsByEmail(email));
    }
    
    @GetMapping("/session/{id}")
    public ResponseEntity<ChatSession> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.getSessionWithMessages(id));
    }

    @Data
    public static class CreateSessionRequest {
        private String email;
        private String title;
    }

    @Data
    public static class AddMessageRequest {
        private Long sessionId;
        private String role;
        private String content;
    }
}
