package br.com.cifras.share.infra;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class ShareLinkRepository implements PanacheRepositoryBase<ShareLinkEntity, UUID> {

    public Optional<ShareLinkEntity> findByToken(String token) {
        return find("token", token).firstResultOptional();
    }
}
