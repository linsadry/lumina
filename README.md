# Lumina
> *Onde cada leitura ilumina a próxima.*

Segundo Cérebro de Leitura — biblioteca pessoal inteligente para organizar livros, artigos, notas e conhecimento conectado.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite |
| Estilo | CSS puro (design system próprio) |
| Backend | Supabase (PostgreSQL + RLS desativado) |
| Auth | PIN 4 dígitos (SHA-256 + salt, localStorage) |
| Hospedagem | Cloudflare Pages |
| Fontes | Playfair Display + Inter (Google Fonts) |
| Ícones | Lucide React |

---

## Estrutura de pastas

```
lumina/
│
├── index.html                  # Entry point HTML (PWA meta tags, fontes)
├── vite.config.js              # Configuração do Vite
├── package.json                # Dependências
│
├── public/
│   ├── manifest.json           # PWA manifest (nome, cores, ícones)
│   ├── icon.png                # Ícone principal do app
│   ├── icon-192.png            # Ícone PWA 192px
│   └── icon-512.png            # Ícone PWA 512px
│
└── src/
    │
    ├── main.jsx                # Ponto de entrada React
    ├── App.jsx                 # Roteamento principal (HashRouter)
    ├── index.css               # Design system completo (tokens, componentes)
    │
    ├── lib/
    │   ├── supabase.js         # Cliente Supabase + USER_ID
    │   └── db.js               # Todas as operações CRUD (livros, notas, stats)
    │
    ├── contexts/
    │   └── AuthContext.jsx     # Estado de autenticação (PIN)
    │
    ├── pages/
    │   ├── Pin.jsx             # Tela de PIN (setup + login)
    │   ├── Home.jsx            # Dashboard (lendo agora, stats, recentes)
    │   ├── Biblioteca.jsx      # Grid de livros com filtros e busca
    │   ├── Livro.jsx           # Detalhe do livro + notas + progresso
    │   └── Stats.jsx           # Estatísticas gerais
    │
    └── components/
        ├── Layout.jsx          # Shell do app + navegação inferior
        ├── BookCard.jsx        # Card de livro (grid e scroll horizontal)
        └── AddBookModal.jsx    # Sheet para adicionar livro (+ busca Open Library)
```

---

## Configuração inicial

### 1. Supabase — rodar o schema

No [SQL Editor do Supabase](https://supabase.com/dashboard), projeto `uxkjvbjlsbgmbalokisf`, rodar o arquivo:

```
lumina-schema.sql
```

Isso cria as tabelas: `lumina_books`, `lumina_notes`, `lumina_collections`, `lumina_sessions`.

### 2. Chave do Supabase

Em `src/lib/supabase.js`, substituir:

```js
const SUPABASE_ANON_KEY = 'COLE_SUA_ANON_KEY_AQUI'
```

A anon key está em: Supabase → Project Settings → API → `anon public`.

### 3. Deploy no Cloudflare Pages

| Campo | Valor |
|-------|-------|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 18+ |

---

## Banco de dados

### `lumina_books`
Campos principais: `title`, `author`, `cover_url`, `format`, `status`, `pages_total`, `current_page`, `rating`, `tags[]`, `collections[]`, `is_favorite`

**Formatos:** `fisico` · `kindle` · `pdf` · `epub` · `audiobook` · `artigo` · `apostila`

**Status:** `lendo` · `quero_ler` · `concluido` · `pausado` · `reler` · `consulta` · `abandonado`

### `lumina_notes`
Notas por livro com tipos: `note` · `insight` · `application` · `highlight` · `reflection` · `question` · `summary`

### `lumina_sessions`
Sessões de leitura por data — usado para calcular streak de dias consecutivos.

### `lumina_collections`
Coleções personalizadas (Glaucoma, Oftalmologia, Fotografia, etc.)

---

## Autenticação

- PIN de 4 dígitos definido na primeira abertura do app
- Hash armazenado em `localStorage` (SHA-256 + salt fixo)
- Usuário único hardcoded: `user_id = 'drika'`
- RLS desativado (app pessoal, single-user)

---

## Funcionalidades

- Biblioteca com grid de capas, filtros por status e formato, busca por título/autor
- Busca automática de capa via [Open Library](https://openlibrary.org) pelo título/autor ou ISBN
- Sistema de notas por livro com 7 tipos (insight, aplicação, reflexão…)
- Rastreamento de progresso por página com barra visual
- Avaliação com estrelas (1–5)
- Favoritos
- Dashboard com lendo agora, streak de dias, meta anual
- Estatísticas por status e formato
- PWA instalável (iOS e Android)

---

## Paleta de cores

| Nome | Hex | Uso |
|------|-----|-----|
| Off White | `#F8F6F2` | Fundo principal |
| Warm Beige | `#E8DDCC` | Cards secundários |
| Sage Green | `#72866F` | Cor da marca, botões |
| Deep Forest | `#33443B` | Títulos, nav |
| Coffee Brown | `#7A5A46` | Destaques |
| Gold | `#B9955A` | Favoritos, avaliações |

---

## Roadmap

- [ ] Artigos científicos (DOI, Journal, PMID)
- [ ] Importação Kindle / Goodreads
- [ ] Coleções com gerenciamento visual
- [ ] IA: resumo, flashcards, conexões entre livros
- [ ] Grafo de conhecimento (D3 force graph)
- [ ] Busca global em notas e destaques
- [ ] Tema escuro (`#1F2420`)
