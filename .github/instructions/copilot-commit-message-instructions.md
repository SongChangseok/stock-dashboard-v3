# Copilot Commit Message Instructions

## Basic Structure

Follow this format for all commit messages:

```
[scope] types: subject

body (optional)

footer (optional)
```

## Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation updates
- **style**: Code formatting (no logic changes)
- **refactor**: Code restructuring without changing functionality
- **test**: Adding or updating tests
- **chore**: Build process, dependencies, or tooling changes
- **perf**: Performance improvements
- **ci**: Continuous integration changes

## Subject Line Rules

- Use imperative mood ("Add feature" not "Added feature")
- Maximum 50 characters
- Capitalize first letter
- No period at the end
- Be specific and descriptive
- **Write in Korean** for better team communication and understanding

## Body Guidelines

- Wrap lines at 72 characters
- Explain what and why, not how
- Use bullet points for multiple changes
- Leave blank line between subject and body

## Examples

### Good Commit Messages (Korean Examples)

```
[auth] feat: OAuth2 로그인 기능 추가

- Google OAuth2 제공자 구현
- 사용자 세션 관리 기능 추가
- 로그인 UI 컴포넌트 업데이트

Closes #123
```

```
[dashboard] fix: 데이터 로딩 경쟁 상태 문제 해결

컴포넌트가 마운트되기 전에 데이터가 준비되지 않아
발생하는 undefined 상태 오류를 방지하도록
비동기 데이터 가져오기를 올바르게 처리

Fixes #456
```

```
[api] refactor: 공통 에러 핸들링 로직 추출

라우트 핸들러 간의 코드 중복을 줄이기 위해
재사용 가능한 에러 핸들러 미들웨어 생성
```

## Scope Examples

- `auth` - Authentication related
- `dashboard` - Dashboard components
- `api` - API endpoints
- `ui` - User interface components
- `db` - Database related
- `config` - Configuration files
- `deps` - Dependencies

## Footer Format

- `Fixes #123` - Closes an issue
- `Closes #123` - Closes an issue
- `Refs #123` - References an issue
- `BREAKING CHANGE:` - For breaking changes

## What to Avoid

- Vague messages like "fix stuff" or "update code"
- Messages longer than 50 characters in subject
- Using past tense
- Including obvious information
- Multiple unrelated changes in one commit
- **Using English when Korean would be clearer for the team**

## Language Guidelines

- **Primary language: Korean** - Use Korean for commit messages to ensure clear communication among Korean-speaking team members
- Use English only for technical terms that are commonly used in English (e.g., API, OAuth2, JWT)
- Keep type labels in English (feat, fix, docs, etc.) as they are standard conventions
