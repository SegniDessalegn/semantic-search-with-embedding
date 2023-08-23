# Semantic Search With Embedding

Implementation of [OpenAI Embedding & Semantic Search using Vector data](https://medium.com/@sathishhariram/openai-embedding-semantic-search-using-vector-data-b785ae7079ff)

# Tech Stack
- Node with vanilla javascript
- Supabase for quick backend service
- OpenAI for content generation

# How to get started
- Create [Supabase](https://supabase.com/) account
- Create new project in Supabase
- Run the following query on the supabase
  ```
  create table semantic-vector-search (
  id serial primary key,
  content text,
  embedding vector(1536)
  );
  ```
  This creates a table called ```semantic-vector-search``` with following columns
  - ```content``` with data type text
  - ```embedding``` with data type vector
- Clone this repo
- ```npm install```
- Create ```.env``` file and add the following variables
  ```
  OPENAI_API_KEY=your-OpenAI-API-key
  SUPABASE_PROJECT_URL=supabase-project-url
  SUPABASE_SECRET_KEY=supabase-project-secret-key
  ```
- Run the following query on Supabase
  ```
  create
  or replace function match_documents (
  query_embedding vector (1536),
  match_threshold float,
  match_count int ) returns table (id bigint, content text, similarity float) language sql stable as $$
  select
    semantic_vector_search.id,
    semantic_vector_search.content,
    1 - (semantic_vector_search.embedding <=> query_embedding) as similarity
  from semantic_vector_search --
  where 1 - (semantic_vector_search.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
  $$;
    ```
- Add your custom content in the ```documents/sample.txt``` file
- ```npm run dev```
- Ask any questions based on the contents in the document
