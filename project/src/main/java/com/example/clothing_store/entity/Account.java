package com.example.clothing_store.entity;

import com.example.clothing_store.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Builder
@Entity
@Table(name = "account")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Account implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String accountCode;
    private String phone;
    @Column(name = "PASS", nullable = false)
    private String pass;
    private String email;
    private String googleId;
    private String gender;
    private LocalDate birthday;
    private String fullName;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "account_roles",
            joinColumns = @JoinColumn(name = "account_id")
    )
    @Column(name = "ROLE")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<Role> roles = new HashSet<>(Collections.singletonList(Role.ROLE_USER));

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.name()))
                .collect(Collectors.toList());
    }

    @Override
    public String getUsername() {
        return phone;
    }

    @Override
    public String getPassword() {
        return pass;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ShippingAddress> shippingAddresses = new ArrayList<>();

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Orders> orders = new ArrayList<>();

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private Cart cart;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();

    public void addShippingAddress(ShippingAddress address) {
        shippingAddresses.add(address);
        address.setAccount(this);
    }

    public void removeShippingAddress(ShippingAddress address) {
        shippingAddresses.remove(address);
        address.setAccount(null);
    }
}
