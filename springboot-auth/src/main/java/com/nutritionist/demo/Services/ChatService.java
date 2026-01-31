package com.nutritionist.demo.Services;

import com.nutritionist.demo.Entities.ChatMessage;
import com.nutritionist.demo.Entities.ChatSession;
import com.nutritionist.demo.Entities.User;
import com.nutritionist.demo.Iservices.IChatService;
import com.nutritionist.demo.Repositories.ChatMessageRepository;
import com.nutritionist.demo.Repositories.ChatSessionRepository;
import com.nutritionist.demo.Repositories.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService implements IChatService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;

    public ChatService(ChatSessionRepository sessionRepository, ChatMessageRepository messageRepository, UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ChatSession createSession(String email, String title) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        ChatSession session = ChatSession.builder()
                .user(user)
                .title(title)
                .createdAt(LocalDateTime.now())
                .build();
        return sessionRepository.save(session);
    }

    @Override
    public ChatSession updateSessionTitle(Long sessionId, String title) {
        ChatSession session = sessionRepository.findById(sessionId).orElseThrow(() -> new RuntimeException("Session not found"));
        session.setTitle(title);
        return sessionRepository.save(session);
    }

    @Override
    public ChatMessage addMessage(Long sessionId, String role, String content) {
        ChatSession session = sessionRepository.findById(sessionId).orElseThrow(() -> new RuntimeException("Session not found"));
        ChatMessage message = ChatMessage.builder()
                .session(session)
                .role(role)
                .content(content)
                .timestamp(LocalDateTime.now())
                .build();
        return messageRepository.save(message);
    }

    @Override
    public List<ChatSession> getSessionsByEmail(String email) {
        return sessionRepository.findByUserEmail(email);
    }

    @Override
    public ChatSession getSessionWithMessages(Long sessionId) {
        return sessionRepository.findById(sessionId).orElseThrow(() -> new RuntimeException("Session not found"));
    }

    @Override
    public void deleteSession(Long sessionId) {
        sessionRepository.deleteById(sessionId);
    }
}
