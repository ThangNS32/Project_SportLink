package com.sportlink.backend.controller;

import com.sportlink.backend.dto.request.CreatePostRequest;
import com.sportlink.backend.dto.request.UpdatePostRequest;
import com.sportlink.backend.dto.response.ApiResponse;
import com.sportlink.backend.dto.response.SportPostResponse;
import com.sportlink.backend.entity.*;
import com.sportlink.backend.service.PostService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostController {

    PostService postService;

    // GET /api/posts?sportType=bong_da&postType=find_team&userLat=10.7&userLng=106.6&radiusKm=5
    @GetMapping
    public ResponseEntity<ApiResponse<List<SportPostResponse>>> getPosts(
            @RequestParam(required = false) SportType sportType,
            @RequestParam(required = false) PostType postType,
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLng,
            @RequestParam(required = false, defaultValue = "5") Double radiusKm) {

        return ResponseEntity.ok(
                ApiResponse.<List<SportPostResponse>>builder()
                        .result(postService.getPosts(sportType, postType, userLat, userLng, radiusKm))
                        .build()
        );
    }

    // GET /api/posts/me
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<SportPostResponse>>> getMyPosts() {
        return ResponseEntity.ok(
                ApiResponse.<List<SportPostResponse>>builder()
                        .result(postService.getMyPosts())
                        .build()
        );
    }

    // GET /api/posts/user/{userId}  — bài đăng còn hạn của 1 user cụ thể
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<SportPostResponse>>> getUserPosts(
            @PathVariable Long userId,
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLng) {
        return ResponseEntity.ok(
                ApiResponse.<List<SportPostResponse>>builder()
                        .result(postService.getUserActivePosts(userId, userLat, userLng))
                        .build()
        );
    }

    // GET /api/posts/search
    // Ví dụ: /api/posts/search?sportType=bong_da&skillLevel=beginner
    //         &playDate=2026-04-10&timeFrom=07:00&timeTo=12:00
    //         &userLat=10.76&userLng=106.66&radiusKm=5
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<SportPostResponse>>> searchPosts(
            @RequestParam(required = false) SportType sportType,
            @RequestParam(required = false) PostType postType,
            @RequestParam(required = false) SkillLevel skillLevel,
            @RequestParam(required = false) LocalDate playDate,
            @RequestParam(required = false) LocalTime timeFrom,
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLng,
            @RequestParam(required = false) PlayFormat playFormat,
            @RequestParam(required = false) SlotsRange slotsRange,
            @RequestParam(required = false) DistanceRange distanceRange) {

        return ResponseEntity.ok(
                ApiResponse.<List<SportPostResponse>>builder()
                        .result(postService.searchPosts(
                                sportType, postType, skillLevel,
                                playDate, timeFrom, userLat, userLng,playFormat,slotsRange,distanceRange))
                        .build()
        );
    }

    // GET /api/posts/{postId}
    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse<SportPostResponse>> getPostById(
            @PathVariable Long postId) {
        return ResponseEntity.ok(
                ApiResponse.<SportPostResponse>builder()
                        .result(postService.getPostById(postId))
                        .build()
        );
    }

    // POST /api/posts
    @PostMapping
    public ResponseEntity<ApiResponse<SportPostResponse>> createPost(
            @RequestBody @Valid CreatePostRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<SportPostResponse>builder()
                        .message("Tạo bài đăng thành công")
                        .result(postService.createPost(request))
                        .build()
        );
    }

    // PUT /api/posts/{postId}
    @PutMapping("/{postId}")
    public ResponseEntity<ApiResponse<SportPostResponse>> updatePost(
            @PathVariable Long postId,
            @RequestBody @Valid UpdatePostRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<SportPostResponse>builder()
                        .message("Cập nhật bài đăng thành công")
                        .result(postService.updatePost(postId, request))
                        .build()
        );
    }

    // DELETE /api/posts/{postId}
    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Xoá bài đăng thành công")
                        .build()
        );
    }

    // GET /api/posts/home?userLat=10.76&userLng=106.66
    @GetMapping("/home")
    public ResponseEntity<ApiResponse<List<SportPostResponse>>> getHomeFeed(
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLng) {
        return ResponseEntity.ok(
                ApiResponse.<List<SportPostResponse>>builder()
                        .result(postService.getHomeFeed(userLat, userLng))
                        .build()
        );
    }

    // GET /api/posts/find-team?userLat=...&userLng=...&radiusKm=5
    @GetMapping("/find-team")
    public ResponseEntity<ApiResponse<List<SportPostResponse>>> getTeamPosts(
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLng,
            @RequestParam(required = false) Double radiusKm) {
        return ResponseEntity.ok(
                ApiResponse.<List<SportPostResponse>>builder()
                        .result(postService.getTeamPosts(userLat, userLng, radiusKm))
                        .build()
        );
    }

    // GET /api/posts/find-rival?userLat=...&userLng=...&radiusKm=5
    @GetMapping("/find-rival")
    public ResponseEntity<ApiResponse<List<SportPostResponse>>> getRivalPosts(
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLng,
            @RequestParam(required = false) Double radiusKm) {
        return ResponseEntity.ok(
                ApiResponse.<List<SportPostResponse>>builder()
                        .result(postService.getRivalPosts(userLat, userLng, radiusKm))
                        .build()
        );
    }


}
