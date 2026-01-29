package com.nutritionist.demo.Iservices;

import com.nutritionist.demo.Entities.History;
import com.nutritionist.demo.Entities.User;
import java.util.List;

public interface IHistoryService {

    History saveHistory(History history);

    List<History> getHistoryByUser(User user);

    void deleteHistory(Long id);
}