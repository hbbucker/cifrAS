# Tarefas - Transição para Coach Marks e Walkthrough

**Status:** Bloqueado (G-TA-01)

## Motivo do Bloqueio
A issue localizada em `.specs/features/fe-onboarding-03-walkthrough/` contém o arquivo `spec.md`, mas o arquivo `design.md` não foi encontrado e não há justificativa de N/A no `spec.md`.

De acordo com as diretrizes do workflow TLC Spec-Driven, a ausência de um documento de design (ou ausência de justificativa explícita de "Fast-Track") impede o progresso para a fase de execução, pois a arquitetura técnica exata, estruturas de dados de estado do tour e design system dos coach marks ainda não estão definidos.

## Recomendação
Recomenda-se o retorno para a fase `Clarify/Plan`. O CTO ou Tech Lead responsável deve providenciar a elaboração do arquivo `design.md` detalhando:
- Arquitetura de estado (`TourProvider`, etc.)
- Integração com `@floating-ui/react` (se escolhida essa abordagem)
- Definição visual e de responsividade no Tailwind.

Somente após a conclusão do `design.md`, este planejamento de tarefas poderá ser realizado.
