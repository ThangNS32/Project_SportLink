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
- `controller/` — REST endpoints: `AuthController` (`/api/auth`), `UserController` (`/api/users`), `SportController` (`/api/users/me/sports`), `PostController` (`/api/posts`).
- `service/` — Business logic: `AuthService`, `UserService`, `SportService`, `PostService`, `GoogleAuthService`, `FileStorageService`.
- `scheduler/` — `PostScheduler`: runs every 60s to set expired posts (`playTime` passed → `status=expired`).
- `repository/` — Spring Data JPA interfaces extending `JpaRepository`.
- `entity/` — JPA entities: `User`, `Sport`, `SportPost`, `InvalidatedToken`. Enums: `SportType` (bong_da, cau_long, pickleball), `SkillLevel`, `PostType`, `PostStatus`, `PlayFormat`, `SlotsRange`, `DistanceRange`.
- `dto/request/` and `dto/response/` — Request/response DTOs validated with Jakarta Bean Validation.
- `mapper/` — MapStruct interfaces: `UserMapper` (User ↔ DTOs, Sport ↔ UserSportResponse), `SportPostMapper` (SportPost ↔ SportPostResponse).
- `exception/` — `AppException` (carries `ErrorCode`), `GlobalExceptionHandler` (@RestControllerAdvice). Error messages are in Vietnamese.
- `configuration/` — `SecurityConfig`, `CustomJwtDecoder`, `ApplicationInitConfig`, `WebConfig`.

**All API responses are wrapped in `ApiResponse<T>`** with `code`, `message`, and `result` fields.

**Error handling:** Throw `AppException(ErrorCode.SOME_CODE)` anywhere; `GlobalExceptionHandler` maps it to the appropriate HTTP status.

## Authentication & Security

- JWT-based auth using Nimbus JOSE (HS512). Token claims: `userId`, `scope` (`SCOPE_USER` or `SCOPE_ADMIN`), `jti` UUID.
- Token blacklist in `invalidated_tokens` table. `CustomJwtDecoder` validates against blacklist on every request. Always check `existsById(jti)` before inserting to avoid duplicate key errors on concurrent requests.
- Public endpoints listed in `SecurityConfig.PUBLIC_ENDPOINTS` (all POST). `GET /api/posts` is also public.
- Admin routes use `@PreAuthorize("hasAuthority('SCOPE_ADMIN')")` at the service layer.
- Default admin: `admin@sportlink.com` / `admin123` — auto-created by `ApplicationInitConfig`.

## Database

- MySQL 8. Connection configured in `application.yaml`. Hibernate DDL auto = `update`.
- JWT config (signer-key, valid-duration, refreshable-duration) also in `application.yaml`.
- Key tables: `users`, `user_sports`, `sport_posts`, `invalidated_tokens`. Planned: `join_requests`, `chat_groups`, `group_members`, `messages`, `notifications`, `ratings`.

## Key Conventions

- Lombok on all DTOs and entities (`@Data`, `@Builder`, `@RequiredArgsConstructor`, `@FieldDefaults`).
- MapStruct mappers use `componentModel = "spring"` and `NullValuePropertyMappingStrategy.IGNORE` for update methods. Enum → String mappings must use `expression = "java(...)"` since MapStruct does not auto-convert.
- `SportPost.distanceKm` in the response is not mapped by MapStruct — it is set manually in `PostService` after Haversine calculation.
- Haversine distance calculation is done in-memory in `PostService` (not in SQL). Posts are fetched by basic filters first, then filtered/sorted by distance in Java streams.
- `User.@PrePersist` sets defaults: role=user, isActive=true, trustScore=5.0, totalRating=0, authProvider=local, createdAt=now.
- `SportPost.@PrePersist` sets defaults: status=open, slotsFilled=0, createdAt=now.
- Auto-ban: `UserService.updateTrustScore()` calls `banUser()` automatically when `newStars <= 2`.
- `@EnableScheduling` is required on `Application.java` for `PostScheduler` to run.