package com.nutritionist.demo.Iservices;

import com.nutritionist.demo.Entities.ChatSession;
import com.nutritionist.demo.Entities.ChatMessage;
import java.util.List;

public interface IChatService {
    ChatSession createSession(String email, String title);
    ChatSession updateSessionTitle(Long sessionId, String title);
    ChatMessage addMessage(Long sessionId, String role, String content);
    List<ChatSession> getSessionsByEmail(String email);
    ChatSession getSessionWithMessages(Long sessionId);
    void deleteSession(Long sessionId);
}
