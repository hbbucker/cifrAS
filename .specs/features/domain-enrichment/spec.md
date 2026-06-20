# Spec: Domain Model Enrichment & Value Objects

## 1. Visão Geral
**ID:** FEAT-DOMAIN-ENRICHMENT
**Objetivo:** Erradicar o anti-pattern "Modelo de Domínio Anêmico" de todo o backend. 
**Motivação:** Atualmente, os Modelos de Domínio (`UserPreference`, `Song`, `Group`, `Playlist`) são meros sacos de dados (atributos públicos, sem métodos de negócio). As regras de validação e estado padrão estão vazando para os `Services`. O uso de DDD tático exige que o Domínio seja rico, proteja suas invariantes e encapsule regras.

## 2. Escopo
O escopo engloba todos os pacotes dentro de `br.com.cifras`:
- `user/model`
- `song/model`
- `group/model`
- `playlist/model`

E seus respectivos `Services` e `Mappers` (que precisarão ser adaptados ao novo encapsulamento).

## 3. Requisitos
- **REQ-01:** Todos os atributos de classes de Domínio devem ser `private`.
- **REQ-02:** Valores fechados devem usar `Enums` (atuando como Value Objects puros) com validação de entrada (ex: `Theme`, `Language`).
- **REQ-03:** Construtores de classes de Domínio devem garantir o estado válido da entidade. O uso do construtor vazio (`public Model() {}`) só deve ser mantido se estritamente necessário por bibliotecas (neste caso, protegido ou privado, caso não seja exigido public).
- **REQ-04:** Mutação de estado deve ocorrer através de métodos verbais com significado de negócio (ex: `acceptInvitation()`, `addSong()`, `changeTheme()`), contendo as validações necessárias, em vez de setters anêmicos.
- **REQ-05:** Nenhuma classe de Infraestrutura/Persistência (`Entity`) deve vazar para a camada de Domínio (Correção pendente no `Playlist.java` que possui `GroupEntity`).

## 4. Critérios de Aceite
- O backend compila sem erros.
- Os testes unitários e de integração existentes continuam passando.
- Os `Services` estão reduzidos a orquestradores.
