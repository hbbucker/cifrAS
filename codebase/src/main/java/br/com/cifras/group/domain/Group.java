package br.com.cifras.group.domain;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

/**
 * Group entity — represents a collaboration group.
 * The creator becomes the OWNER via a GroupMember record.
 */
@Entity
@Table(name = "grupos")
public class Group extends PanacheEntity {

    @NotBlank
    @Column(nullable = false)
    public String name;

    @NotBlank
    public String ownerId;
}
