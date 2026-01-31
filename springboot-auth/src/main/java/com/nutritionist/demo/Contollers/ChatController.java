package com.nutritionist.demo.Contollers;

import com.nutritionist.demo.Entities.ChatMessage;
import com.nutritionist.demo.Entities.ChatSession;
import com.nutritionist.demo.Iservices.IChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final IChatService chatService;

    public ChatController(IChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/session")
    public ResponseEntity<ChatSession> createSession(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String title = request.getOrDefault("title", "New Conversation");
        return ResponseEntity.ok(chatService.createSession(email, title));
    }

    @PutMapping("/session/{id}/title")
    public ResponseEntity<ChatSession> updateTitle(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String title = request.get("title");
        return ResponseEntity.ok(chatService.updateSessionTitle(id, title));
    }

    @PostMapping("/message")
    public ResponseEntity<ChatMessage> addMessage(@RequestBody Map<String, Object> request) {
        Long sessionId = Long.valueOf(request.get("sessionId").toString());
        String role = request.get("role").toString();
        String content = request.get("content").toString();
        return ResponseEntity.ok(chatService.addMessage(sessionId, role, content));
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<ChatSession>> getSessions(@PathVariable String email) {
        return ResponseEntity.ok(chatService.getSessionsByEmail(email));
    }

    @GetMapping("/session/{id}")
    public ResponseEntity<ChatSession> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.getSessionWithMessages(id));
    }

    @DeleteMapping("/session/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        chatService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}
