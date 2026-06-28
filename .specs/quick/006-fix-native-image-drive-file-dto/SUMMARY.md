# Summary: Corrigida serialização nativa de DriveFileDTO

## Changes
- **DriveFileDTO.java**: Adicionada a anotação `@RegisterForReflection` para permitir que o Jackson consiga serializar as instâncias deste record em formato JSON quando rodando dentro da imagem nativa GraalVM.

## Verification
- Compilação realizada com sucesso (`./mvnw compile`).
