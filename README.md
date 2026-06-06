# Codebase Intel

> AI-powered codebase understanding for developers. Ask anything about any GitHub repository in plain English.

---

## What it does

Codebase Intel lets you ingest any public GitHub repository and instantly understand it through:

- **Natural language chat** — ask questions, get answers with exact file citations
- **Knowledge graph** — visualize import dependencies and file relationships
- **Impact analysis** — find which files break if you change a specific file
- **Function descriptions** — AI-generated descriptions for every function and file
- **Auto documentation** — generate README-style architecture summaries

---

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Python 3.11 |
| LLM | Groq (Llama 3.3 70B) |
| Embeddings | HuggingFace (all-MiniLM-L6-v2) |
| Vector Store | Supabase pgvector |
| Graph | NetworkX, tree-sitter |
| RAG | LangChain |
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Auth & DB | Supabase |
| Containerization | Docker, Docker Compose |

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 22+
- Docker Desktop
- Supabase account (free tier)
- Groq API key (free tier)
- HuggingFace API token (free tier)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/codebase-intel.git
cd codebase-intel
```

### 2. Set up environment variables

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

### 3. Set up Supabase

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable pgvector
create extension if not exists vector;

-- Repositories table
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

-- Chunks table (vector store)
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

-- Graphs table
create table graphs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  repo_name text not null,
  graph_data jsonb not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, repo_name)
);

-- Similarity search function
create or replace function match_chunks(
  query_embedding vector(384),
  match_user_id uuid,
  match_repo_name text,
  match_count int default 5
)
returns table (
  id uuid,
  file_path text,
  content text,
  language text,
  functions text,
  classes text,
  similarity float
)
language sql stable
as $$
  select id, file_path, content, language, functions, classes,
    1 - (embedding <=> query_embedding) as similarity
  from chunks
  where user_id = match_user_id and repo_name = match_repo_name
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Enable RLS
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

### 4. Run with Docker

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
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Usage

1. **Sign up** at `http://localhost:3000`
2. **Ingest** a public GitHub repo URL
3. **Chat** — ask anything about the codebase
4. **Details** — explore the dependency graph and analyze files
5. **Impact** — see what breaks if a file changes

---

