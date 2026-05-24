# CifrAS 🎸

**CifrAS** é uma plataforma moderna e responsiva projetada para músicos que precisam de uma ferramenta eficiente para gerenciar, transpor e compartilhar cifras de violão e guitarra. 

Focado especialmente em músicos que tocam ao vivo (em missas, bares, shows ou ensaios), o CifrAS resolve desafios reais como a necessidade de adaptar o tom de uma música rapidamente, organizar repertórios em playlists e colaborar com outros músicos.

---

## 🌟 Principais Funcionalidades

* **Gerenciamento de Repertório:** Adicione, edite, visualize e busque músicas e cifras na sua biblioteca pessoal.
* **Transposição Inteligente:** Mude o tom de qualquer música instantaneamente (meio tom para cima ou para baixo). O sistema recalcula automaticamente os acordes mantendo a legibilidade.
* **Playlists:** Crie listas de reprodução para seus eventos, ordene as músicas e navegue facilmente entre elas.
* **Colaboração e Grupos:** Crie grupos com outros músicos, compartilhe seu repertório e mantenha playlists colaborativas onde todos podem contribuir.
* **Modo Teatro (Performance):** Uma interface limpa, focada e em tela cheia para uso durante apresentações ao vivo. Conta com rolagem automática (autoscroll) ajustável e controles rápidos de transposição.

---

## 🏗️ Arquitetura e Tecnologias

O projeto adota uma arquitetura full-stack moderna, focada em performance e escalabilidade:

### Frontend
* **React 19** + **TypeScript**
* **Vite** para build e desenvolvimento super rápido
* **TailwindCSS** para uma estilização responsiva e ágil
* **Playwright** para testes End-to-End (E2E)

### Backend
* **Java 21**
* **Quarkus** (Framework Java nativo, rápido e de baixo consumo de memória)
* **Maven** para gerenciamento de dependências
* Testes integrados com **Testcontainers**

### Banco de Dados e Autenticação
* **Supabase** gerenciando toda a autenticação de usuários (JWT) e fornecendo a base de dados relacional (**PostgreSQL**).

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* **Node.js** (v20+)
* **Java** (JDK 21+)
* **Maven** (ou utilize o wrapper `./mvnw` incluso)
* Conta no **Supabase** (para as variáveis de ambiente do backend)

### 1. Configurando o Projeto (Quarkus + Quinoa + React)
Navegue até a pasta `codebase/` e configure o arquivo de ambiente:
```bash
cd codebase
# Crie seu arquivo .env baseado nas variáveis necessárias (Supabase URL, API Keys, DB Password)
./mvnw quarkus:dev
```
O Quarkus irá compilar o backend e utilizar a extensão Quinoa para rodar o Vite e servir o frontend automaticamente.
Acesse a aplicação em `http://localhost:8080`.
O backend (REST API) estará disponível em `http://localhost:8080/api` e o frontend estará na raiz.

---

## ⚙️ CI/CD (Integração e Entrega Contínuas)

O projeto possui uma pipeline automatizada configurada via **GitHub Actions** (`.github/workflows/ci.yml`).
A cada *Pull Request* ou *Push* na branch principal, o GitHub automaticamente:
1. Sobe o ambiente Java 21, compila o código e executa todos os testes do Quarkus.
2. Sobe o ambiente Node 20, verifica o código via Linter (ESLint), faz o build do React e roda os testes End-to-End (E2E) do Playwright.

---

> Desenvolvido para transformar a experiência de organização e performance musical. 🎶
