# Arquitetura Backend Java (Quarkus) Orientada a Features e IA

## Objetivo

Este documento define a arquitetura oficial do projeto, estabelecendo padrões para organização de código, responsabilidades das camadas e diretrizes para manutenção por desenvolvedores humanos e agentes de IA.

Os objetivos principais são:

* Alta coesão e baixo acoplamento.
* Facilidade de manutenção e evolução.
* Redução da complexidade arquitetural.
* Melhor compreensão do sistema por agentes de IA.
* Regras de negócio centralizadas no domínio.
* Minimização de classes "God Object".
* Facilidade de testes automatizados.

---

# Princípios Arquiteturais

## 1. Feature First

O sistema deve ser organizado por contexto funcional (feature) e não por tipo técnico.

### Correto

```text
product/
stock/
pricing/
marketplace/
order/
```

### Evitar

```text
controller/
service/
repository/
dto/
entity/
```

A organização por feature reduz o contexto necessário para entender um fluxo completo e facilita análises realizadas por IA.

---

## 2. Domínio Rico

Toda regra de negócio deve residir no domínio.

O domínio é o coração do sistema.

Exemplos:

* validações de negócio
* invariantes
* cálculos
* políticas
* decisões de negócio
* regras de consistência

### Correto

```java
product.updatePrice(...)
```

```java
product.canPublish()
```

```java
product.validateStock()
```

### Incorreto

```java
productService.calculatePrice(...)
```

```java
productService.validateStock(...)
```

---

## 3. Application Layer Apenas Orquestra

A camada de Application (Use Cases) coordena o fluxo.

Ela:

* inicia transações
* consulta repositórios
* chama integrações
* executa operações do domínio
* persiste alterações

Ela não contém regras de negócio.

### Correto

```java
@Transactional
public void execute(UpdatePriceCommand command) {

    Product product =
        repository.findById(command.productId());

    product.updatePrice(command.newPrice());

    repository.save(product);
}
```

### Incorreto

```java
@Transactional
public void execute(UpdatePriceCommand command) {

    if (command.newPrice() < 0) {
        throw new BusinessException();
    }

    if (product.isBlocked()) {
        throw new BusinessException();
    }

    ...
}
```

Essas validações pertencem ao domínio.

---

## 4. Infraestrutura é Detalhe

Banco de dados, Kafka, Redis, APIs externas e mecanismos de cache são detalhes de implementação.

O domínio não pode depender deles.

---

## Estrutura de Diretórios

```text
src/main/java/br/com/cifras

├── config/
│
├── shared/
│   ├── exception/
│   ├── validation/
│   ├── event/
│   ├── util/
│   └── constants/
│
├── product/
│   ├── resource/
│   ├── application/
│   ├── model/
│   ├── dto/
│   └── infra/
│
├── pricing/
│   ├── resource/
│   ├── application/
│   ├── model/
│   ├── dto/
│   └── infra/
│
├── stock/
│   ├── resource/
│   ├── application/
│   ├── model/
│   ├── dto/
│   └── infra/
│
└── marketplace/
    ├── resource/
    ├── application/
    ├── model/
    ├── dto/
    └── infra/
```

---

# Responsabilidade das Camadas

## Resource

Responsável apenas pela interface HTTP.

Funções:

* Receber requests
* Chamar Use Cases
* Retornar responses
* Converter DTOs

Não deve conter:

* regras de negócio
* validações de negócio
* consultas complexas

### Exemplo

```java
@Path("/products")
public class ProductResource {

    @Inject
    UpdatePriceUseCase updatePriceUseCase;

    @PUT
    public Response update(UpdatePriceRequest request) {

        updatePriceUseCase.execute(
            request.toCommand()
        );

        return Response.noContent().build();
    }
}
```

---

## Application

Responsável pela orquestração dos fluxos.

Funções:

* abrir transações
* consultar repositórios
* coordenar operações
* publicar eventos
* chamar integrações

Não deve conter:

* cálculos
* regras de negócio
* decisões de domínio

### Estrutura

```text
application/

├── command/
├── query/
├── usecase/
└── mapper/
```

### Exemplo

```java
public class UpdatePriceUseCase {

    public void execute(UpdatePriceCommand command) {

        Product product =
            repository.findById(command.productId());

        product.updatePrice(command.price());

        repository.save(product);
    }
}
```

---

## Model

Representa o domínio do negócio.

Contém:

* entidades
* value objects
* regras
* validações
* invariantes

### Estrutura

```text
model/

├── Product.java
├── ProductPrice.java
├── ProductStatus.java
├── ProductRules.java
└── ProductValidator.java
```

### Exemplo

```java
public class Product {

    public void updatePrice(BigDecimal price) {

        if (price.signum() < 0) {
            throw new InvalidPriceException();
        }

        this.price = price;
    }
}
```

---

## DTO

Representa contratos externos.

### Estrutura

```text
dto/

├── request/
└── response/
```

### Exemplo

```text
dto/

├── request/
│   └── UpdatePriceRequest.java
│
└── response/
    └── ProductResponse.java
```

DTOs nunca devem conter regras de negócio.

---

## Infra

Responsável pelas implementações técnicas.

### Estrutura

```text
infra/

├── persistence/
│   ├── entity/
│   ├── repository/
│   └── mapper/
│
├── messaging/
│   └── kafka/
│
├── integration/
│   ├── marketplace/
│   ├── payment/
│   └── shipping/
│
└── cache/
```

---

# Regras para Repositórios

Os repositórios devem possuir apenas operações de persistência.

### Correto

```java
repository.findById(id);
repository.save(product);
```

### Evitar

```java
repository.calculatePrice(...);
```

```java
repository.validateStock(...);
```

---

# Transações

Toda transação deve ser iniciada na camada Application.

### Correto

```java
@Transactional
public void execute(...)
```

### Evitar

```java
@Transactional
public void updatePrice(...)
```

dentro de Resource ou Model.

---

# Eventos de Domínio

Quando necessário, eventos devem ser publicados após alterações significativas do domínio.

### Exemplo

```java
ProductPriceUpdated
ProductPublished
StockUpdated
```

Esses eventos devem representar fatos de negócio.

---

# Diretrizes para Agentes de IA

## Fluxo de Análise

Ao analisar um bug ou implementar uma funcionalidade:

1. Identificar a feature.
2. Localizar o Resource correspondente.
3. Identificar o Use Case envolvido.
4. Localizar o Model utilizado.
5. Verificar regras existentes antes de criar novas.
6. Procurar reutilização antes de criar código.

---

## Onde Adicionar Código

### Nova regra de negócio

Adicionar em:

```text
model/
```

---

### Novo fluxo de negócio

Adicionar em:

```text
application/usecase/
```

---

### Novo endpoint

Adicionar em:

```text
resource/
```

---

### Nova integração externa

Adicionar em:

```text
infra/integration/
```

---

### Nova persistência

Adicionar em:

```text
infra/persistence/
```

---

## Proibições

Agentes de IA e desenvolvedores não devem:

* adicionar regras em Resource
* adicionar regras em DTO
* adicionar regras em Repository
* adicionar regras em Integration Clients
* duplicar regras existentes
* criar lógica de negócio em mappers

---

# Testes

## Testes de Domínio

Devem validar:

* regras
* invariantes
* cálculos

Cobertura prioritária.

---

## Testes de Use Cases

Devem validar:

* orquestração
* transações
* integrações

---

## Testes de Resource

Devem validar:

* contratos HTTP
* serialização
* códigos de resposta

---

# Critérios de Qualidade

Todo Pull Request deve responder:

### 1

A regra está no domínio?

### 2

Existe duplicação?

### 3

O Use Case apenas orquestra?

### 4

O endpoint está livre de regras?

### 5

Os testes cobrem o comportamento alterado?

### 6

A feature continua compreensível de forma isolada?

---

# Resumo Executivo

Este projeto adota uma arquitetura baseada em:

* Feature-Based Packaging
* Vertical Slice Architecture
* Rich Domain Model
* Application Layer para orquestração
* Infraestrutura desacoplada do domínio

O objetivo é maximizar:

* legibilidade
* manutenibilidade
* produtividade
* testabilidade
* compreensão por agentes de IA

mantendo uma complexidade significativamente menor que uma implementação completa de Arquitetura Hexagonal ou Clean Architecture tradicional.
