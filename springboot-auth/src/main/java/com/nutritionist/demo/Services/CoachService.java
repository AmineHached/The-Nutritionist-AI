package com.nutritionist.demo.Services;

import com.nutritionist.demo.Entities.ChatMessage;
import com.nutritionist.demo.Entities.ChatSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CoachService {

    private final WebClient webClient;
    private final ChatService chatService;

    public CoachService(WebClient.Builder webClientBuilder, @Value("${ai.service.url:http://localhost:8000/api}") String aiServiceUrl, ChatService chatService) {
        this.webClient = webClientBuilder.baseUrl(aiServiceUrl).build();
        this.chatService = chatService;
    }

    public Map<String, Object> sendChat(String email, String message, Long sessionId) {
        // Prepare history
        List<Map<String, String>> history = new ArrayList<>();
        if (sessionId != null) {
            try {
                ChatSession session = chatService.getSessionWithMessages(sessionId);
                // Get last 10 messages for context
                List<ChatMessage> existing = session.getMessages();
                int start = Math.max(0, existing.size() - 10);
                for (int i = start; i < existing.size(); i++) {
                    ChatMessage msg = existing.get(i);
                    Map<String, String> m = new HashMap<>();
                    m.put("role", msg.getRole());
                    m.put("content", msg.getContent());
                    history.add(m);
                }
            } catch (Exception e) {
                // Session might not be found or other error, ignore and start fresh context
            }
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("user_email", email);
        payload.put("message", message);
        payload.put("session_id", sessionId);
        payload.put("history", history);

        return webClient.post()
                .uri("/coach/chat")
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }
}
