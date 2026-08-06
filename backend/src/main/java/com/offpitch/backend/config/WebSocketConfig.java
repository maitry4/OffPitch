package com.offpitch.backend.config;

import com.offpitch.backend.signal.SignalWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final SignalWebSocketHandler signalWebSocketHandler;

    public WebSocketConfig(SignalWebSocketHandler signalWebSocketHandler) {
        this.signalWebSocketHandler = signalWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(signalWebSocketHandler, "/ws/signal")
                .setAllowedOrigins("http://localhost:3000");
    }
}
