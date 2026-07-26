package com.offpitch.backend.controller;

import com.offpitch.backend.model.User;
import com.offpitch.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtDecoder jwtDecoder;

    public AuthController(AuthService authService, JwtDecoder jwtDecoder) {
        this.authService = authService;
        this.jwtDecoder = jwtDecoder;
    }

    /**
     * POST /api/auth/google
     *
     * The frontend sends { "idToken": "<Google ID token>" }.
     * We decode + validate it, upsert the user, and return their profile.
     */
    @PostMapping("/google")
    public ResponseEntity<Map<String, Object>> loginWithGoogle(
            @RequestBody Map<String, String> body) {

        String idToken = body.get("idToken");
        if (idToken == null || idToken.isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "idToken is required"));
        }

        // Decode and validate against Google's JWKS
        Jwt jwt = jwtDecoder.decode(idToken);

        // Upsert user from the token claims
        User user = authService.upsertFromGoogle(jwt.getClaims());

        return ResponseEntity.ok(Map.of(
            "id",         user.getId().toString(),
            "email",      user.getEmail(),
            "name",       user.getName() != null ? user.getName() : "",
            "pictureUrl", user.getPictureUrl() != null ? user.getPictureUrl() : "",
            "username",   user.getUsername() != null ? user.getUsername() : ""
        ));
    }
}
