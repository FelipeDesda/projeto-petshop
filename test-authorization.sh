#!/bin/bash

# 🧪 Script de Testes - Sistema de Autorização PetShop API
# Uso: bash test-authorization.sh

set -e

BASE_URL="http://localhost:8080"
ADMIN_EMAIL="admin@petshop.local"
ADMIN_PASS="admin123"
USER_EMAIL="cliente1@petshop.local"
USER_PASS="admin123"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
PASS=0
FAIL=0

# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"
}

test_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASS++))
}

test_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAIL++))
}

test_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Testa se o status code é o esperado
assert_status() {
    local expected=$1
    local actual=$2
    local message=$3
    
    if [ "$actual" -eq "$expected" ]; then
        test_success "$message (Status: $actual)"
    else
        test_fail "$message (Status esperado: $expected, obtido: $actual)"
        return 1
    fi
}

# ============================================================================
# 1. AUTENTICAÇÃO
# ============================================================================

print_header "1. AUTENTICAÇÃO"

# Login Admin
test_info "Fazendo login como admin..."
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}" \
    -w "\n%{http_code}")

ADMIN_HTTP=$(echo "$ADMIN_LOGIN" | tail -n1)
ADMIN_BODY=$(echo "$ADMIN_LOGIN" | head -n-1)
ADMIN_TOKEN=$(echo "$ADMIN_BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$ADMIN_TOKEN" ]; then
    assert_status 200 "$ADMIN_HTTP" "Login admin bem-sucedido"
else
    test_fail "Login admin - sem token na resposta"
    echo "Response: $ADMIN_BODY"
fi

# Login User
test_info "Fazendo login como user..."
USER_LOGIN=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASS\"}" \
    -w "\n%{http_code}")

USER_HTTP=$(echo "$USER_LOGIN" | tail -n1)
USER_BODY=$(echo "$USER_LOGIN" | head -n-1)
USER_TOKEN=$(echo "$USER_BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$USER_TOKEN" ]; then
    assert_status 200 "$USER_HTTP" "Login user bem-sucedido"
else
    test_fail "Login user - sem token na resposta"
    echo "Response: $USER_BODY"
fi

# ============================================================================
# 2. TESTES DE USUÁRIOS
# ============================================================================

print_header "2. TESTES DE USUÁRIOS"

# Admin lista todos os usuários
test_info "Admin listando todos os usuários..."
USERS_ADMIN=$(curl -s -X GET "$BASE_URL/users" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -w "\n%{http_code}")
USERS_ADMIN_HTTP=$(echo "$USERS_ADMIN" | tail -n1)
assert_status 200 "$USERS_ADMIN_HTTP" "Admin: Listar todos usuários"

# User tenta listar todos os usuários (deve falhar)
test_info "User tentando listar todos os usuários (esperado: 403)..."
USERS_USER=$(curl -s -X GET "$BASE_URL/users" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -w "\n%{http_code}")
USERS_USER_HTTP=$(echo "$USERS_USER" | tail -n1)
assert_status 403 "$USERS_USER_HTTP" "User: Listar todos usuários (deve ser 403)"

# User vê seus próprios dados
test_info "User vendo seus próprios dados..."
GET_SELF=$(curl -s -X GET "$BASE_URL/users/2" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -w "\n%{http_code}")
GET_SELF_HTTP=$(echo "$GET_SELF" | tail -n1)
assert_status 200 "$GET_SELF_HTTP" "User: Ver seus próprios dados"

# User tenta ver outro usuário (deve falhar)
test_info "User tentando ver dados de outro usuário (esperado: 403)..."
GET_OTHER=$(curl -s -X GET "$BASE_URL/users/1" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -w "\n%{http_code}")
GET_OTHER_HTTP=$(echo "$GET_OTHER" | tail -n1)
assert_status 403 "$GET_OTHER_HTTP" "User: Ver dados de outro usuário (deve ser 403)"

# Admin vê qualquer usuário
test_info "Admin vendo qualquer usuário..."
ADMIN_GET_USER=$(curl -s -X GET "$BASE_URL/users/2" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -w "\n%{http_code}")
ADMIN_GET_USER_HTTP=$(echo "$ADMIN_GET_USER" | tail -n1)
assert_status 200 "$ADMIN_GET_USER_HTTP" "Admin: Ver qualquer usuário"

# ============================================================================
# 3. TESTES DE ENDEREÇOS
# ============================================================================

print_header "3. TESTES DE ENDEREÇOS"

# User lista seus endereços
test_info "User listando seus endereços..."
ADDR_LIST=$(curl -s -X GET "$BASE_URL/addresses" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -w "\n%{http_code}")
ADDR_LIST_HTTP=$(echo "$ADDR_LIST" | tail -n1)
assert_status 200 "$ADDR_LIST_HTTP" "User: Listar seus endereços"

# Sem autenticação (deve falhar)
test_info "Tentando acessar endereços sem autenticação (esperado: 401)..."
NO_AUTH=$(curl -s -X GET "$BASE_URL/addresses" \
    -w "\n%{http_code}")
NO_AUTH_HTTP=$(echo "$NO_AUTH" | tail -n1)
assert_status 401 "$NO_AUTH_HTTP" "Sem autenticação (deve ser 401)"

# ============================================================================
# 4. TESTES DE PRODUTOS
# ============================================================================

print_header "4. TESTES DE PRODUTOS"

# Público lista produtos
test_info "Público listando produtos (sem autenticação)..."
PROD_PUBLIC=$(curl -s -X GET "$BASE_URL/products" \
    -w "\n%{http_code}")
PROD_PUBLIC_HTTP=$(echo "$PROD_PUBLIC" | tail -n1)
assert_status 200 "$PROD_PUBLIC_HTTP" "Público: Listar produtos"

# User tenta criar produto (deve falhar)
test_info "User tentando criar produto (esperado: 403)..."
PROD_USER=$(curl -s -X POST "$BASE_URL/products" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Teste","description":"Teste","category":"Teste","price":10,"stock":5}' \
    -w "\n%{http_code}")
PROD_USER_HTTP=$(echo "$PROD_USER" | tail -n1)
assert_status 403 "$PROD_USER_HTTP" "User: Criar produto (deve ser 403)"

# Admin cria produto
test_info "Admin criando produto..."
PROD_ADMIN=$(curl -s -X POST "$BASE_URL/products" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Ração Teste","description":"Ração para testes","category":"Alimentação","price":129.90,"stock":25}' \
    -w "\n%{http_code}")
PROD_ADMIN_HTTP=$(echo "$PROD_ADMIN" | tail -n1)
assert_status 201 "$PROD_ADMIN_HTTP" "Admin: Criar produto" || assert_status 200 "$PROD_ADMIN_HTTP" "Admin: Criar produto (pode retornar 200)"

# ============================================================================
# 5. TESTES DE PETS
# ============================================================================

print_header "5. TESTES DE PETS"

# User lista seus pets
test_info "User listando seus pets..."
PETS_LIST=$(curl -s -X GET "$BASE_URL/pets" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -w "\n%{http_code}")
PETS_LIST_HTTP=$(echo "$PETS_LIST" | tail -n1)
assert_status 200 "$PETS_LIST_HTTP" "User: Listar seus pets"

# ============================================================================
# 6. TESTES DE PEDIDOS
# ============================================================================

print_header "6. TESTES DE PEDIDOS"

# User lista seus pedidos
test_info "User listando seus pedidos..."
ORDERS_LIST=$(curl -s -X GET "$BASE_URL/orders" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -w "\n%{http_code}")
ORDERS_LIST_HTTP=$(echo "$ORDERS_LIST" | tail -n1)
assert_status 200 "$ORDERS_LIST_HTTP" "User: Listar seus pedidos"

# ============================================================================
# RESUMO
# ============================================================================

print_header "RESUMO DOS TESTES"

TOTAL=$((PASS + FAIL))
PERCENTAGE=$((PASS * 100 / TOTAL))

echo -e "${GREEN}✅ Sucessos: $PASS${NC}"
echo -e "${RED}❌ Falhas: $FAIL${NC}"
echo -e "${BLUE}📊 Total: $TOTAL${NC}"
echo -e "${BLUE}📈 Percentual: $PERCENTAGE%${NC}"

if [ $FAIL -eq 0 ]; then
    echo -e "\n${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}\n"
    exit 0
else
    echo -e "\n${RED}⚠️  ALGUNS TESTES FALHARAM${NC}\n"
    exit 1
fi
