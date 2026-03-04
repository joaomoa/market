# Mini Bolsa para Crianças 🎓

Simulação de mercado simplificada para atividades escolares, com 4 ativos e evolução aleatória baseada no perfil de risco de cada ativo.

## Como Usar

- Abre `index.html` no navegador e projeta para a sala.
- **Temporizador** — conta o tempo desde que abriste a página.
- **Próxima Ronda** — clica para avançar de ronda. Os preços evoluem automaticamente conforme o perfil de risco de cada ativo (baixa/média/alta volatilidade).
- São **5 rondas** no total.

## Ativos

| Ativo | Preço Inicial | Volatilidade |
|-------|---------------|--------------|
| 🟡 Ouro | 2 | Baixa (±1) |
| 🏠 Casa | 5 | Média (±2) |
| 🏢 Empresa | 1 | Alta (±3) |
| 🚗 Carro | 3 | Baixa (±1) |

A evolução é aleatória e controlada pelo sistema, mas de acordo com o perfil de risco/retorno de cada ativo.

## Estrutura

```
/mini-bolsa
├── index.html
├── assets/
│   ├── styles.css
│   └── script.js
└── README.md
```

## Licença

Uso livre para fins educativos.
