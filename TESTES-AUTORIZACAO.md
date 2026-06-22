# 🧪 Guia de Testes - Sistema de Autorização

## 📥 Importar Coleção no Insomnia

1. Abra o **Insomnia**
2. Vá em **Insomnia** → **Preferences** → **Data** → **Import/Export**
3. Clique em **Import Data** → selecione o arquivo `insomnia-autorization-tests.json`
4. Selecione a workspace "PetShop API - Testes de Segurança"

---

## ✅ Sequência de Testes

### 1️⃣ **Autenticação**

Execute nesta ordem:

#### a) Login Admin
- **Request**: `1. Login Admin`
- **Esperado**: Status 200, retorna token
- **Token salvo em**: `admin_token`

```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@petshop.local","password":"admin123"}'
```

#### b) Login User Normal
- **Request**: `2. Login User Normal (ID 2)`
- **Esperado**: Status 200, retorna token
- **Nota**: O usuário `cliente1@petshop.local` foi criado no seed.sql

```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente1@petshop.local","password":"admin123"}'
```

---

### 2️⃣ **Testes de Usuários (Users)**

#### ✅ Admin pode listar todos
- **Request**: `✅ Admin: Listar todos usuários`
- **Esperado**: 200, lista de todos os usuários

#### ❌ User NÃO pode listar todos
- **Request**: `❌ User: Listar todos usuários (403)`
- **Esperado**: 403 Forbidden
- **Resposta**: `{"error":"Access denied: Admin role required"}`

#### ✅ User vê seus próprios dados
- **Request**: `✅ User: Ver seus próprios dados`
- **Esperado**: 200, dados do user ID 2

#### ❌ User NÃO vê dados de outro
- **Request**: `❌ User: Ver dados de outro usuário (403)`
- **Esperado**: 403 Forbidden
- **Resposta**: `{"error":"Access denied: You can only access your own data"}`

#### ✅ Admin vê qualquer usuário
- **Request**: `✅ Admin: Ver qualquer usuário`
- **Esperado**: 200, dados de qualquer usuário

---

### 3️⃣ **Testes de Endereços (Addresses)**

#### ✅ User vê seus endereços
- **Request**: `✅ User: Listar seus endereços`
- **Esperado**: 200, lista filtrando apenas endereços do user
- **Nota**: A query deve retornar apenas endereços com `id_user = user_id`

#### ❌ Sem autenticação
- **Request**: `❌ Sem autenticação: 401`
- **Esperado**: 401 Unauthorized
- **Resposta**: `{"error":"Authorization header is required"}`

#### ✅ User cria endereço
- **Request**: `✅ User: Criar endereço`
- **Esperado**: 201, endereço criado
- **Nota**: User só consegue se `id_user` na body for o seu próprio ID

---

### 4️⃣ **Testes de Pets (Pets)**

#### ✅ User vê seus pets
- **Request**: `✅ User: Listar seus pets`
- **Esperado**: 200, lista filtrando apenas pets do user

---

### 5️⃣ **Testes de Produtos (Products)**

#### ✅ Público lista produtos (sem auth)
- **Request**: `✅ Público: Listar produtos`
- **Esperado**: 200, lista de produtos (qualquer um pode ver)

#### ❌ User NÃO pode criar produto
- **Request**: `❌ User: Criar produto (403)`
- **Esperado**: 403 Forbidden
- **Resposta**: `{"error":"Access denied: Admin role required"}`

#### ✅ Admin cria produto
- **Request**: `✅ Admin: Criar produto`
- **Esperado**: 201, produto criado

---

### 6️⃣ **Testes de Pedidos (Orders)**

#### ✅ User vê seus pedidos
- **Request**: `✅ User: Listar seus pedidos`
- **Esperado**: 200, lista filtrando apenas pedidos do user

---

## 🔍 O que validar em cada teste

| Esperado | O que verificar |
|----------|----------------|
| ✅ **200/201** | Status de sucesso, dados corretos na resposta |
| ❌ **401** | "Authorization header is required" ou "Invalid token" |
| ❌ **403** | "Access denied: Admin role required" ou "You can only access your own data" |
| 📋 **Filtering** | Lista deve retornar APENAS dados do usuário autenticado |
| 🔑 **Token** | Contém `id` e `role` (decodifique em https://jwt.io) |

---

## 🐛 Troubleshooting

### Teste retorna 500 Internal Server Error
- Verifique os logs do Docker: `docker compose logs nodeweb-container`
- Verifique se o banco está rodando: `docker compose ps`

### Teste retorna 404
- Verifique se a rota existe
- Confira a URL base: `http://localhost:8080`
- Verifique se o ID do recurso existe no banco

### Token inválido
- Certifique-se de fazer login ANTES de fazer outros testes
- O token pode ter expirado (24h)
- Copie o token do response de login para a variável de ambiente

### User sem permissão para criar recurso
- Verifique se o `id_user` na body é o ID do user autenticado
- Admin pode criar para outros users
- User normal só consegue criar para si mesmo

---

## 📊 Checklist de Validação

Após completar todos os testes, você deve ter:

- [ ] Login admin funcionando
- [ ] Login user funcionando  
- [ ] Admin pode listar TODOS os usuários
- [ ] User NÃO pode listar todos os usuários (403)
- [ ] User vê apenas seus dados
- [ ] User NÃO vê dados de outro (403)
- [ ] Admin vê dados de qualquer user
- [ ] User vê apenas seus endereços
- [ ] User vê apenas seus pets
- [ ] User vê apenas seus pedidos
- [ ] Produtos listáveis publicamente
- [ ] User NÃO pode criar produto (403)
- [ ] Admin cria produtos
- [ ] Admin cria produtos para si mesmo
- [ ] Sem token retorna 401

---

## 💡 Dicas

1. **Copie tokens**: Ao fazer login, o token é salvo automaticamente em `admin_token` ou `user_token`
2. **Reutilize tokens**: Você pode usar `{{ admin_token }}` em qualquer request dentro da mesma sessão
3. **Teste falhas**: Tente com tokens expirados ou inválidos para validar as respostas de erro
4. **Veja o payload JWT**: Cole o token em https://jwt.io para decodificar e ver `id` e `role`

---

## 🔄 Teste Completo (tudo de uma vez)

Se quiser testar tudo rapidamente, execute nesta ordem:

1. Login Admin → Salva `admin_token`
2. Login User → Salva `user_token`
3. Admin: Listar usuários → ✅
4. User: Listar usuários → ❌ 403
5. User: Ver seus dados → ✅
6. User: Ver outro user → ❌ 403
7. Admin: Ver qualquer user → ✅
8. User: Listar endereços → ✅
9. User: Listar produtos (sem auth) → ✅
10. User: Criar produto → ❌ 403
11. Admin: Criar produto → ✅

**Resultado esperado**: 5 ✅ de sucesso, 5 ❌ de acesso negado
