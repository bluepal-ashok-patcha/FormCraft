package com.formcraft.entity.builder;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "form_drafts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "form_id")
    private UUID formId; // Link to existing form if editing

    @Column(nullable = false)
    private String name;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> schema;

    @Column(name = "starts_at")
    private LocalDateTime startsAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "banner_url")
    private String bannerUrl;

    @Column(name = "theme_color")
    private String themeColor;

    @Column(name = "created_by", nullable = false)
    private String createdBy; // Username of the admin

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
