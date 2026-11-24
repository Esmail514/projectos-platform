# Auto-API & Performance Architecture Reference: Coolify, Supabase & Directus

This reference provides technical procedures, query dialects, and performance optimization rules for architecting auto-generated REST/GraphQL APIs and reverse proxy infrastructures using **Coolify**, **Supabase (PostgREST)**, and **Directus**.

---

## 1. Coolify Ingress & Auto-API Pairing Reference

### Traefik v3 Dynamic Configuration
Coolify coordinates reverse proxy routing via Traefik labels injected into container definitions:
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.my-api.rule=Host(`api.projectos.dev`)"
  - "traefik.http.routers.my-api.entrypoints=websecure"
  - "traefik.http.routers.my-api.tls.certresolver=letsencrypt"
  - "traefik.http.services.my-api.loadbalancer.server.port=3000"
```

### Enterprise Pairing Topology
```
               [ HTTPS / Internet ]
                         │
                         ▼
             [ Traefik v3 (Coolify) ]  (SSL Termination & Zero-Downtime Swaps)
                         │
          ┌──────────────┴──────────────┐
          │ (Internal Docker Bridge)     │
          ▼                             ▼
  [ PostgREST Container ]        [ Directus Container ]
  (High-Throughput Public API)   (Backoffice Studio & Aggregations)
          │                             │
          └──────────────┬──────────────┘
                         │ (Internal IPC / <0.5ms)
                         ▼
             [ PostgreSQL Container ]
             (RLS Kernel Security)
```

---

## 2. Supabase / PostgREST Query Reference

### Direct-to-SQL Execution Model
PostgREST transforms incoming HTTP queries into a single SQL statement:
```sql
SELECT json_build_object(
  'id', users.id,
  'name', users.name,
  'posts', coalesce(posts_agg.posts, '[]'::json)
)
FROM users
LEFT JOIN LATERAL (
  SELECT json_agg(json_build_object('id', posts.id, 'title', posts.title)) as posts
  FROM posts WHERE posts.user_id = users.id
) posts_agg ON true;
```

### Query Dialect Cheatsheet
| Operation | HTTP Request | SQL Equivalent |
| :--- | :--- | :--- |
| **Simple Filter** | `GET /items?status=eq.active` | `WHERE status = 'active'` |
| **Logical OR** | `GET /items?or=(status.eq.active,priority.gt.5)` | `WHERE status = 'active' OR priority > 5` |
| **Relational Join** | `GET /users?select=name,posts(title,comments(content))` | `LEFT JOIN LATERAL ...` |
| **Stored Procedure**| `POST /rpc/calculate_tax` `{"amount": 100}` | `SELECT calculate_tax(100);` |
| **Upsert** | `POST /items` `Prefer: resolution=merge-duplicates` | `INSERT ... ON CONFLICT DO UPDATE` |

---

## 3. Directus REST Query Reference

### Dialect Cheatsheet
| Operation | HTTP Request | Directus Mechanism |
| :--- | :--- | :--- |
| **Field Projection** | `GET /items/articles?fields=id,title,author.name` | Knex SELECT projection |
| **Deep Filtering** | `GET /items/articles?filter[author][city][_eq]=NYC` | Knex WHERE with sub-query |
| **Aggregations** | `GET /items/orders?aggregate[sum]=total&groupBy[]=status`| Knex GROUP BY & aggregate |
| **Batch Pagination** | `GET /items/articles?limit=25&offset=50` | Knex LIMIT / OFFSET |

### N+1 Prevention Pattern
Directus executes relational queries via batched `WHERE IN (...)` lookups:
1. `SELECT * FROM articles LIMIT 25;`
2. `SELECT * FROM authors WHERE id IN (1, 3, 7, 12, ...);`
3. Directus in-memory assembler joins the returned records before emitting JSON.
Result: exactly $K+1$ queries for $K$ relational depth levels, preventing $O(N)$ cascades.

---

## 4. Performance & Sizing Decision Tree

1. **Does the application demand >10,000 requests/sec with minimal CPU?**
   - **Yes** $\rightarrow$ Use **Supabase (PostgREST)**. It compiles directly to SQL with zero ORM overhead and sub-2ms latency.
2. **Does the client require multi-column dynamic grouping & aggregations over REST?**
   - **Yes** $\rightarrow$ Use **Directus**. Its REST dialect supports `aggregate` and `groupBy` out-of-the-box.
3. **Does the architecture involve multiple microservices with container lifecycle needs?**
   - **Yes** $\rightarrow$ Deploy on **Coolify** bare-metal infrastructure with Traefik routing and Rust Sentinel health monitoring.
