package com.example.clothing_store.security;

import org.springframework.security.core.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.*;

public class CustomOAuth2User implements OAuth2User {
    private final Map<String, Object> attrs;

    public CustomOAuth2User(Map<String, Object> attrs) {
        this.attrs = attrs;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attrs;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getName() {
        return (String) attrs.get("sub");
    }
}
