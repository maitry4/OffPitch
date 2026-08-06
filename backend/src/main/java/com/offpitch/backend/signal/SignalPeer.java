package com.offpitch.backend.signal;

import org.springframework.web.socket.WebSocketSession;

import java.util.UUID;

public class SignalPeer {

    private final UUID userId;
    private final String inviteCode;
    private final WebSocketSession session;
    private boolean camOn;
    private boolean micOn;

    public SignalPeer(UUID userId, String inviteCode, WebSocketSession session) {
        this.userId = userId;
        this.inviteCode = inviteCode;
        this.session = session;
        this.camOn = false;
        this.micOn = false;
    }

    public UUID getUserId() { return userId; }
    public String getInviteCode() { return inviteCode; }
    public WebSocketSession getSession() { return session; }
    public boolean isCamOn() { return camOn; }
    public boolean isMicOn() { return micOn; }

    public void setCamOn(boolean camOn) { this.camOn = camOn; }
    public void setMicOn(boolean micOn) { this.micOn = micOn; }
}
