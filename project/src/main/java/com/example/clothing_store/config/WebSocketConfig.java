package com.example.clothing_store.config;

import com.example.clothing_store.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat")
                .setAllowedOrigins("http://localhost:3000")
                .addInterceptors(new JwtHandshakeInterceptor(jwtUtil, userDetailsService))
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                // Bao bọc message ban đầu để thao tác header
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

                // 1) Xử lý frame CONNECT
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    System.out.println(">>> STOMP CONNECT headers: " + accessor.toNativeHeaderMap());

                    // Thử lấy token từ header CONNECT
                    List<String> auth = accessor.getNativeHeader("Authorization");
                    if (auth != null && !auth.isEmpty()) {
                        String token = auth.get(0).replaceFirst("Bearer ", "");
                        if (jwtUtil.validateToken(token)) {
                            String username = jwtUtil.extractUsername(token);
                            UserDetails user = userDetailsService.loadUserByUsername(username);
                            Authentication authn = new UsernamePasswordAuthenticationToken(
                                    user, null, user.getAuthorities()
                            );
                            accessor.setUser(authn);
                            System.out.println(">>> STOMP CONNECT via Header, user=" + username);
                        }
                    }

                    // Fallback: lấy Authentication từ HandshakeInterceptor
                    if (accessor.getUser() == null && accessor.getSessionAttributes() != null) {
                        Authentication sessAuth =
                                (Authentication) accessor.getSessionAttributes().get("user");
                        if (sessAuth != null) {
                            accessor.setUser(sessAuth);
                            System.out.println(">>> STOMP CONNECT via Handshake attrs, user="
                                    + sessAuth.getName());
                        }
                    }
                }
                // 2) Xử lý frame SEND
                else if (StompCommand.SEND.equals(accessor.getCommand())) {
                    // Thử lấy token từ header SEND
                    List<String> auth = accessor.getNativeHeader("Authorization");
                    if (auth != null && !auth.isEmpty()) {
                        String token = auth.get(0).replaceFirst("Bearer ", "");
                        if (jwtUtil.validateToken(token)) {
                            String username = jwtUtil.extractUsername(token);
                            UserDetails user = userDetailsService.loadUserByUsername(username);
                            Authentication authn = new UsernamePasswordAuthenticationToken(
                                    user, null, user.getAuthorities()
                            );
                            accessor.setUser(authn);
                            System.out.println(">>> STOMP SEND via Header, user=" + username);
                        }
                    }
                    // Fallback: lấy từ sessionAttributes
                    if (accessor.getUser() == null && accessor.getSessionAttributes() != null) {
                        Authentication sessAuth =
                                (Authentication) accessor.getSessionAttributes().get("user");
                        if (sessAuth != null) {
                            accessor.setUser(sessAuth);
                            System.out.println(">>> STOMP SEND via Handshake attrs, user="
                                    + sessAuth.getName());
                        }
                    }
                }
                // 3) Các frame khác (SUBSCRIBE, etc.) nếu cần, cũng fallback
                else {
                    if (accessor.getUser() == null && accessor.getSessionAttributes() != null) {
                        Authentication sessAuth =
                                (Authentication) accessor.getSessionAttributes().get("user");
                        if (sessAuth != null) {
                            accessor.setUser(sessAuth);
                            System.out.println(">>> STOMP " + accessor.getCommand()
                                    + " via Handshake attrs, user="
                                    + sessAuth.getName());
                        }
                    }
                }

                // Tạo lại Message với header đã chỉnh sửa
                return MessageBuilder
                        .createMessage(message.getPayload(), accessor.getMessageHeaders());
            }
        });
    }


}
