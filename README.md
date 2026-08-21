# CLRS Asymptotic Engine 🚀⚡

Uma aplicação de análise de complexidade assintótica de algoritmos clássicos da literatura **CLRS** (*Introduction to Algorithms* - Cormen et al.), executando motores nativos em **C++** compilados para **WebAssembly (WASM)** diretamente no navegador.

## 📌 Visão Geral

O projeto permite simular e analisar empiricamente o desempenho de algoritmos de ordenação e estruturas de dados com alta precisão, medindo:
- 📊 **Número exato de comparações**
- 🔄 **Número exato de atribuições/trocas**
- ⏱️ **Tempo real de execução da CPU (em microssegundos / milissegundos)**

Atualmente, o projeto conta com a implementação do **Insertion Sort** ($O(n^2)$) para o pior caso e vetores de tamanho configurável.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Engine Nativo:** C++17
- **WebAssembly:** [Emscripten (em++)](https://emscripten.org/)
- **Estilização & Ícones:** Vanilla CSS / Modern UI, [Lucide React](https://lucide.dev/)
- **Linter & Runtime:** [Oxlint](https://oxc.rs/), [Bun](https://bun.sh/)

---

## 📁 Estrutura do Projeto

```
clrs-analyzer/
├── native/
│   └── clrs_engine.cpp      # Motor nativo em C++ com emscripten bindings
├── public/
│   └── wasm/                # Artefatos compilados em WebAssembly (.js / .wasm)
├── src/
│   ├── components/          # Componentes React (SidePanel, ScoreBoard)
│   ├── App.tsx              # Componente principal da aplicação
│   ├── main.tsx             # Ponto de entrada React
│   └── index.css            # Estilos globais
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🚀 Como Executar

### 1. Pré-requisitos
- Node.js (v18+) ou Bun
- *(Opcional)* Emscripten SDK (`em++`) para recompilar o código C++

### 2. Instalação
```bash
# Clone o repositório
git clone https://github.com/Gediael54/clrs-analyzer.git

# Acesse a pasta do projeto
cd clrs-analyzer

# Instale as dependências
bun install
# ou
npm install
```

### 3. Executando em Modo de Desenvolvimento
```bash
bun run dev
# ou
npm run dev
```

Acesse no navegador: `http://localhost:5173`

---

## ⚙️ Compilação do WebAssembly (C++)

Caso faça alterações no arquivo `native/clrs_engine.cpp`, recompile o WebAssembly com o comando:

```bash
bun run build:wasm
# ou diretamente via Emscripten:
em++ -O3 -std=c++17 native/clrs_engine.cpp \
  --bind \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME="loadCLRSModule" \
  -o public/wasm/clrs_engine.js
```

---

## 📦 Build para Produção

```bash
bun run build
# ou
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

---

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se livre para estudar, modificar e contribuir!