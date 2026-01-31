package com.nutritionist.demo.Repositories;

import com.nutritionist.demo.Entities.ChatSession;
import com.nutritionist.demo.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUser(User user);
    List<ChatSession> findByUserEmail(String email);
}
