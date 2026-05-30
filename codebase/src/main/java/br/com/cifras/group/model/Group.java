package br.com.cifras.group.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.UuidGenerator;
import java.util.UUID;

/**
 * Group entity — represents a collaboration group.
 * The creator becomes the OWNER via a GroupMember record.
 */
@Entity
@Table(name = "grupos")
public class Group extends PanacheEntityBase {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    public UUID id;

    @NotBlank
    @Column(nullable = false)
    public String name;

    @NotBlank
    public String ownerId;
}
