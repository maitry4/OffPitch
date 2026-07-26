package com.offpitch.backend.service;

import com.offpitch.backend.model.User;
import com.offpitch.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Find-or-create a user from Google OAuth claims.
     * If the user already exists (matched by google_id), update their
     * profile fields in case anything changed on the Google side.
     */
    public User upsertFromGoogle(Map<String, Object> claims) {
        String googleId = (String) claims.get("sub");
        String email    = (String) claims.get("email");
        String name     = (String) claims.get("name");
        String picture  = (String) claims.get("picture");

        return userRepository.findByGoogleId(googleId)
            .map(existing -> {
                existing.setEmail(email);
                existing.setName(name);
                existing.setPictureUrl(picture);
                existing.setUpdatedAt(Instant.now());
                return userRepository.save(existing);
            })
            .orElseGet(() -> {
                User newUser = new User(googleId, email, name, picture);
                return userRepository.save(newUser);
            });
    }
}
