package com.nutritionist.demo.Repositories;

import com.nutritionist.demo.Entities.ChatMessage;
import com.nutritionist.demo.Entities.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySession(ChatSession session);
}
