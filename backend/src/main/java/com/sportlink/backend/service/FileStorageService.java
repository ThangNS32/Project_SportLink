package com.sportlink.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sportlink.backend.exception.AppException;
import com.sportlink.backend.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp"
    );

    private final Cloudinary cloudinary;

    public String storeAvatar(MultipartFile file) {
        if (file.isEmpty()) throw new AppException(ErrorCode.INVALID_FILE);
        if (!ALLOWED_TYPES.contains(file.getContentType())) throw new AppException(ErrorCode.INVALID_FILE_TYPE);

        try {
            Map result = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("folder", "sportlink/avatars"));
            String url = (String) result.get("secure_url");
            log.info("Uploaded avatar to Cloudinary: {}", url);
            return url;
        } catch (IOException e) {
            log.error("Cloudinary upload failed: {}", e.getMessage());
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    public void deleteAvatar(String avatarUrl) {
        if (avatarUrl == null || avatarUrl.startsWith("https://")) return;
    }
}