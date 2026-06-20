# CifrAS Codebase Conventions

## 1. Single Responsibility Principle (SRP) e Vertical Slicing

Para mantermos o código altamente sustentável para agentes de IA e humanos, aplicamos rigorosamente o Padrão de Responsabilidade Única utilizando **Strict Use Cases** e **Sliced Resources**. 

### ❌ O que NÃO fazer (God Services / Middle Man Factories)
Nunca crie serviços que agrupam todas as regras de negócio de um agregado. E nunca crie "Factories" ou "Facades" vazias só para repassar chamadas.
```java
// ERRADO: God Service
@ApplicationScoped
public class GroupService {
    public void createGroup(...) { ... }
    public void addMember(...) { ... }
    public void linkPlaylist(...) { ... }
}

// ERRADO: God Controller
@Path("/groups")
public class GroupResource {
    @Inject GroupService service; // Injeta um monstro que faz 50 coisas
    
    @POST ...
    @POST @Path("/{id}/members") ...
    @POST @Path("/{id}/playlists") ...
}
```

### ✅ O que FAZER (Strict Use Cases e Fatiamento REST)
Cada operação de negócio é um `UseCase` isolado com injeções mínimas.
Os `Resources` devem ser criados acompanhando o escopo das URIs aninhadas.

**Exemplo de Use Case:**
```java
// CERTO: Apenas 1 responsabilidade
@ApplicationScoped
public class AddGroupMemberUseCase {
    @Inject GroupRepository groupRepo;
    
    public void execute(UUID groupId, String memberId, String ownerId) {
        // Lógica
    }
}
```

**Exemplo de Resource Fatiado:**
Em vez de colocar a rota de membros dentro de `GroupResource`, criamos um Resource focado:
```java
// CERTO: Focado em membros
@Path("/groups/{id}/members")
public class GroupMemberResource {
    @Inject AddGroupMemberUseCase addMemberUseCase;
    @Inject RemoveGroupMemberUseCase removeMemberUseCase;

    @POST
    public Response add(...) {
        addMemberUseCase.execute(...);
        return Response.noContent().build();
    }
}
```

## 2. Rich Domain Models
Nenhuma classe de serviço deve possuir lógica transacional de estado. Toda alteração de estado interno deve ser feita através de métodos de domínio (Tell, Don't Ask). Entidades não devem possuir setters públicos triviais. Use métodos semânticos (`makeCollaborative()`, `acceptInvitation()`, etc).
