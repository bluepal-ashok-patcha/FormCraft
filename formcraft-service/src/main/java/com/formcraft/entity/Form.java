package com.formcraft.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "forms")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Form extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private java.util.Map<String, Object> schema;


    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status")
    private com.formcraft.enums.FormStatus status = com.formcraft.enums.FormStatus.ACTIVE;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "starts_at")
    private LocalDateTime startsAt;

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<FormResponse> responses;

    @Column(name = "banner_url")
    private String bannerUrl;

    @Column(name = "theme_color")
    private String themeColor;
}
