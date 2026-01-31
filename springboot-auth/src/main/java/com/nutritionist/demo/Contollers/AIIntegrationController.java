package com.nutritionist.demo.Contollers;

import com.nutritionist.demo.Services.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:4200")
public class AIIntegrationController {

    @Autowired
    private AIService aiService;

    @PostMapping("/analyze")
    public ResponseEntity<String> analyzeFood(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "user_email", defaultValue = "user@example.com") String userEmail) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"File is empty\"}");
            }
            
            byte[] bytes = file.getBytes();
            String result = aiService.analyzeFoodImage(bytes, file.getOriginalFilename(), userEmail);
            
            return ResponseEntity.ok(result);
            
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("{\"error\": \"Error processing file: " + e.getMessage() + "\"}");
        }
    }
}
