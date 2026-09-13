# Migração para o repositório próprio

Este projeto nasceu na pasta `justgospeldance/` do repositório `Felipedb/Felipedb`
porque a integração do GitHub usada na sessão não tem permissão para criar
repositórios. Os passos abaixo movem a pasta, com histórico, para um repositório
`Felipedb/JustGospelDance` novo. Apague este arquivo depois de migrar.

## 1. Criar o repositório vazio no GitHub

Em https://github.com/new, nome `JustGospelDance`, sem README, sem `.gitignore`
e sem licença (visibilidade e licença são decisões suas).

## 2. Extrair a pasta com histórico e enviar

```bash
git clone https://github.com/Felipedb/Felipedb.git felipedb-tmp
cd felipedb-tmp
git checkout claude/justgospeldance-repo-setup-hwtf87
git subtree split --prefix=justgospeldance -b jgd-main
git push https://github.com/Felipedb/JustGospelDance.git jgd-main:main
cd .. && rm -rf felipedb-tmp
```

## 3. Limpar o repositório de perfil

Fechar o PR desta branch sem fazer merge (a pasta não deve entrar no `main` do
perfil) e apagar a branch `claude/justgospeldance-repo-setup-hwtf87`.

## Alternativa

Depois de criar o repositório vazio, abrir uma nova sessão do Claude Code com
`Felipedb/JustGospelDance` anexado e pedir para fazer a migração.
