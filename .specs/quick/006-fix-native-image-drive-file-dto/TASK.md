# Quick Fix: Erro ao serializar DriveFileDTO na imagem nativa

## Description
Quando o frontend chama a rota `/integrations/google/drive/files`, o backend tenta retornar uma lista de `DriveFileDTO`. Em modo de desenvolvimento e JVM puro, isso funciona normalmente. No entanto, quando compilado como imagem nativa (GraalVM), a serialização Jackson falha com `InvalidDefinitionException: No serializer found for class br.com.cifras.integration.dto.DriveFileDTO`.

## Root Cause
Em tempo de execução da imagem nativa, o Quarkus e o GraalVM exigem que classes que serão convertidas de/para JSON via reflexão sejam marcadas explicitamente. Sem essa marcação, o GraalVM não inclui os metadados de reflexão na imagem, causando o erro em tempo de execução.

## Fix
Adicionada a anotação `@io.quarkus.runtime.annotations.RegisterForReflection` ao record `DriveFileDTO`. Isso sinaliza ao compilador nativo do Quarkus que ele deve manter os construtores e métodos de acesso da classe disponíveis para a biblioteca Jackson.

## Scope
- `codebase/src/main/java/br/com/cifras/integration/dto/DriveFileDTO.java`
