
## Codebase Intel

AI-Powered Codebase Understanding Platform

## The Problem
Large codebases are difficult to navigate, especially for developers who are new to a project or working across unfamiliar repositories. Traditional tools like grep or keyword search return raw results without any semantic understanding, forcing developers to manually trace through hundreds of files to answer basic questions about how a system works, what a function does, or what breaks if a file changes.

## The Solution
Codebase Intel ingests any public GitHub repository and builds an intelligent understanding of it — allowing developers to ask questions in plain English and receive accurate, file-cited answers. Key features include:

- Semantic chat — Ask anything about the codebase and get streaming answers powered by a RAG pipeline with conversation memory
- Knowledge graph — AST-parsed dependency graph visualizing file relationships and import chains
- Impact analysis — Identifies which files and modules are affected when a specific file changes
- Function descriptions — AI-generated descriptions for every function and file in the repo
- Auto documentation — Generates README-style architecture summaries for any ingested repository
- Per-user isolation — Each user's ingested data is stored separately using Supabase Auth with row-level security

## Tech Stack

**Languages:**
- Python 3.11
- TypeScript
- SQL

**Frameworks:**
- FastAPI (backend API)
- Next.js 15 (frontend)
- LangChain (RAG pipeline)

**Databases:**
- Supabase (PostgreSQL + pgvector)

**APIs and Third-party Tools:**
- Groq API — Llama 3.3 70B (LLM)
- HuggingFace Inference API — all-MiniLM-L6-v2 (embeddings)
- Supabase Auth (authentication)
- GitHub REST API (repository cloning)
- tree-sitter (AST parsing for JS/TS)
- NetworkX (knowledge graph)
- Docker + Docker Compose (containerization)
- React Flow (interactive graph visualization)

## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 22+
- Docker Desktop
- Supabase account (free tier) — [supabase.com](https://supabase.com)
- Groq API key (free tier) — [console.groq.com](https://console.groq.com)
- HuggingFace API token (free tier) — [huggingface.co](https://huggingface.co)

### 1. Clone the repository
```bash
git clone https://github.com/Achuth05/Codebase-Intel.git
cd Codebase-Intel
```
### 2. Set up Supabase
Go to your Supabase dashboard → SQL Editor and run the following:

```sql
create extension if not exists vector;

create table repositories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  repo_name text not null,
  github_url text not null,
  total_files int default 0,
  total_chunks int default 0,
  graph_nodes int default 0,
  graph_edges int default 0,
  created_at timestamp with time zone default now(),
  unique(user_id, repo_name)
);

create table chunks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  repo_name text not null,
  file_path text not null,
  content text not null,
  embedding vector(384),
  language text,
  functions text,
  classes text,
  created_at timestamp with time zone default now()
);

create table graphs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  repo_name text not null,
  graph_data jsonb not null,
  created_at timestamp with time zone default now(),
  unique(user_id, repo_name)
);

create or replace function match_chunks(
  query_embedding vector(384),
  match_user_id uuid,
  match_repo_name text,
  match_count int default 5
)
returns table (
  id uuid, file_path text, content text,
  language text, functions text, classes text, similarity float
)
language sql stable as $$
  select id, file_path, content, language, functions, classes,
    1 - (embedding <=> query_embedding) as similarity
  from chunks
  where user_id = match_user_id and repo_name = match_repo_name
  order by embedding <=> query_embedding
  limit match_count;
$$;

alter table repositories enable row level security;
alter table chunks enable row level security;
alter table graphs enable row level security;

create policy "Users can only access their own repositories"
on repositories for all using (auth.uid() = user_id);

create policy "Users can only access their own chunks"
on chunks for all using (auth.uid() = user_id);

create policy "Users can only access their own graphs"
on graphs for all using (auth.uid() = user_id);
```

Also go to **Authentication → Settings** and disable email confirmation for easier testing.

### 3. Configure environment variables
**Backend** — create `backend/.env`:

```env
REPOS_DIR=app/repos
GROQ_API_KEY=your_groq_api_key
HF_API_TOKEN=your_huggingface_token
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```

**Frontend** — create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Root** — create `.env` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

### 4. Run with Docker (recommended)
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 5. Run without Docker (development)

**Backend:**

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend** (in a separate terminal):

```bash
cd frontend
npm install
npm run dev
```

---

### 6. Usage
1. Open http://localhost:3000
2. Sign up for an account
3. Go to **Ingest** and paste any public GitHub URL
4. Wait for ingestion to complete (2–10 minutes depending on repo size)
5. Go to **Chat** and ask anything about the codebase
6. Explore **Details** for the dependency graph and impact analysis