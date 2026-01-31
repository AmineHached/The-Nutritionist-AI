package com.nutritionist.demo.Iservices;
import com.nutritionist.demo.Entities.User;
import java.util.Optional;
import java.util.List;


public interface IUserService {

    User register(User user);

    Optional<User> findByEmail(String email);

    User findById(Long id);

    List<User> findAll();

    
    User updateUser(Long id, User user);

   
    void deleteUser(Long id);
}