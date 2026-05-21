package com.sportlink.backend.service;

import com.sportlink.backend.exception.AppException;
import com.sportlink.backend.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp"
    );

    @Value("${app.upload.dir}")
    private String uploadDir;

    // ── Lưu file ảnh, trả về tên file đã lưu ──────────────
    public String storeAvatar(MultipartFile file) {
        // Kiểm tra file rỗng
        if (file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }

        // Kiểm tra định dạng
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE);
        }

        // Tạo tên file duy nhất tránh trùng
        String extension = getExtension(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + extension;

        try {
            Path uploadPath = Paths.get(uploadDir);

            // Tạo thư mục nếu chưa có
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Lưu file
            Path targetPath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Saved avatar file: {}", fileName);
            return fileName;

        } catch (IOException e) {
            log.error("Failed to store file: {}", e.getMessage());
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    // ── Xoá file cũ khi user đổi avatar ───────────────────
    public void deleteAvatar(String fileName) {
        if (fileName == null || fileName.isBlank()) return;

        try {
            Path filePath = Paths.get(uploadDir).resolve(fileName);
            Files.deleteIfExists(filePath);
            log.info("Deleted old avatar: {}", fileName);
        } catch (IOException e) {
            log.warn("Could not delete old avatar: {}", e.getMessage());
        }
    }

    // ── Private helper ─────────────────────────────────────
    private String getExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return ".jpg";
        }
        return originalFilename.substring(originalFilename.lastIndexOf("."));
    }
}

