# Contributing & Development Workflow

Welcome to the **FormCraft** team. This guide outlines our internal development standards, branching strategies, and contribution workflow.

---

## 🏗 Branching Strategy

We follow a **Trunk-Based Development** model with short-lived feature branches:

- **`main`**: Production-ready code (stable).
- **`develop`**: Integration branch for new features.
- **`feature/feature-name`**: Specific feature development.
- **`bugfix/issue-id`**: Specific bug resolution.
- **`hotfix/issue-id`**: Quick fixes for production bugs.

---

## 🛠 Commit Standards

We use the **Conventional Commits** format:

- `feat(auth): add login validation`
- `fix(builder): resolve JSONB schema mismatch`
- `docs(api): update Swagger annotations`
- `refactor(service): simplify FormValidator`
- `test(security): add JWT refresh integration test`

---

## 📝 Coding Standards

### Backend (Java)
- Use **Java 17** language features (records, text blocks).
- Avoid `null` whenever possible (use `Optional`).
- Every Service method must have proper error handling via `GlobalExceptionHandler`.
- Controller paths should be plural (e.g., `/api/forms`, `/api/users`).
- Use **Lombok** (`@Data`, `@Builder`, `@RequiredArgsConstructor`) to reduce boilerplate.

### Frontend (React)
- Components should be **functional** and use **hooks** (`useEffect`, `useState`, `useMemo`).
- **Separation of Concerns**: Data fetching should stay in `/services/`, components should only manage UI state.
- Use **Lucide React** for icons and **Tailwind CSS** for all styling.
- All interactive elements must have a unique `ID` for E2E testing.

---

## ✅ Pull Request (PR) Process

1.  **Create a Branch**: `git checkout -b feature/awesome-feature`
2.  **Develop & Test**: Ensure all unit tests pass locally.
3.  **Run Lint/Format**:
    - Backend: `./mvnw spring-boot:run` (check if it boots)
    - Frontend: `npm run lint`
4.  **Open PR**: Submit your PR to the `develop` branch.
5.  **Review**: At least one peer review is required.
6.  **Merge**: Squashed merges are preferred.

---

## 🔬 Testing Policy

- **Unit Tests**: Mandatory for all business logic in `Service` layers.
- **Integration Tests**: Required for `Controller` endpoints using Testcontainers and MockMvc.
- **E2E Tests**: Recommended for high-priority user journeys (Registration, Form Creation).

---

## 📧 Support
For specialized architectural questions, contact the development lead.
