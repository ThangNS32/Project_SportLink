# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run the application
./mvnw spring-boot:run

# Build
./mvnw clean package

# Run all tests
./mvnw test

# Run a single test class
./mvnw test -Dtest=ApplicationTests

# Build without tests
./mvnw clean package -DskipTests
```

The app runs on `http://localhost:8080/sportlink`.

## Architecture

Standard Spring Boot layered architecture: Controller → Service → Repository → Entity.

**Package structure under `com.sportlink.backend`:**
- `controller/` — REST endpoints. Currently only `AuthController` (`/api/auth`).
- `service/` — Business logic. `AuthService` handles all auth operations.
- `repository/` — Spring Data JPA interfaces extending `JpaRepository`.
- `entity/` — JPA entities (`User`, `InvalidatedToken`).
- `dto/request/` and `dto/response/` — Request/response DTOs (validated with Jakarta Bean Validation).
- `mapper/` — MapStruct interfaces for DTO ↔ entity conversion (Spring component model).
- `exception/` — `AppException` (custom RuntimeException carrying an `ErrorCode`), `ErrorCode` enum, and `GlobalExceptionHandler` (@RestControllerAdvice).
- `configuration/` — `SecurityConfig`, `CustomJwtDecoder`, `ApplicationInitConfig`.

**All API responses are wrapped in `ApiResponse<T>`** with `code`, `message`, and `result` fields.

**Error handling:** Throw `AppException(ErrorCode.SOME_CODE)` anywhere; `GlobalExceptionHandler` maps it to the appropriate HTTP status. Add new error codes to the `ErrorCode` enum (with HTTP status and message).

## Authentication & Security

- JWT-based auth using Nimbus JOSE (HS512 algorithm). Tokens contain `userId`, `scope` (`SCOPE_USER` or `SCOPE_ADMIN`), and a `jti` UUID.
- Token blacklist stored in `invalidated_tokens` table — used for logout and refresh (old token is invalidated on refresh).
- `CustomJwtDecoder` validates tokens against the blacklist on every request.
- Public endpoints are explicitly listed in `SecurityConfig`. All others require a valid JWT. Admin routes (`/api/admin/**`) require `SCOPE_ADMIN`.
- Default admin account (`admin@sportlink.com` / `admin123`) is auto-created at startup by `ApplicationInitConfig` if no admin exists.

## Database

- MySQL 8. Configure connection in `application.yaml`. Hibernate DDL auto is set to `update` (schema evolves automatically in dev).
- JWT config (secret key, valid duration, refreshable duration) is also in `application.yaml`.

## Key Conventions

- Use Lombok (`@Data`, `@Builder`, `@RequiredArgsConstructor`, etc.) on all DTOs and entities.
- Add MapStruct mapper methods in `UserMapper` (or new mapper interfaces) for any new entity ↔ DTO conversions. The mapper uses `componentModel = "spring"`.
- `ErrorCode` messages are currently in Vietnamese — keep new codes consistent.
- `User` entity uses `@PrePersist` to set defaults (role=user, isActive=true, trustScore=5.0, authProvider=local, createdAt=now).
