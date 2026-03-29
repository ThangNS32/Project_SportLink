package com.sportlink.backend.mapper;

import com.sportlink.backend.dto.request.RegisterRequest;
import com.sportlink.backend.dto.request.UpdateProfileRequest;
import com.sportlink.backend.dto.response.UserResponse;
import com.sportlink.backend.entity.User;
import org.mapstruct.*;

import java.util.List;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserMapper {

    // RegisterRequest → User entity
    @Mapping(target = "userId",       ignore = true)
    @Mapping(target = "googleId",     ignore = true)
    @Mapping(target = "authProvider", ignore = true)
    @Mapping(target = "avatarUrl",    ignore = true)
    @Mapping(target = "age",          ignore = true)
    @Mapping(target = "locationLat",  ignore = true)
    @Mapping(target = "locationLng",  ignore = true)
    @Mapping(target = "role",         ignore = true)
    @Mapping(target = "isActive",     ignore = true)
    @Mapping(target = "trustScore",   ignore = true)
    @Mapping(target = "banUntil",     ignore = true)
    @Mapping(target = "totalRating",  ignore = true)
    @Mapping(target = "createdAt",    ignore = true)
    @Mapping(target = "password",     ignore = true) // Set riêng vì cần BCrypt
    User toUser(RegisterRequest request);

    // User entity → UserResponse
    @Mapping(target = "role", expression = "java(user.getRole().name())")
    @Mapping(
            target = "trustScore",
            expression = "java(user.getTrustScore() != null ? user.getTrustScore().doubleValue() : 5.0)"
    )
    UserResponse toUserResponse(User user);

    // List<User> → List<UserResponse>
    List<UserResponse> toUserResponseList(List<User> users);

    // Update profile — chỉ cập nhật các field không null
    @Mapping(target = "userId",       ignore = true)
    @Mapping(target = "email",        ignore = true) // Không cho đổi email
    @Mapping(target = "password",     ignore = true) // Đổi password riêng
    @Mapping(target = "googleId",     ignore = true)
    @Mapping(target = "authProvider", ignore = true)
    @Mapping(target = "role",         ignore = true)
    @Mapping(target = "isActive",     ignore = true)
    @Mapping(target = "trustScore",   ignore = true)
    @Mapping(target = "banUntil",     ignore = true)
    @Mapping(target = "totalRating",  ignore = true)
    @Mapping(target = "createdAt",    ignore = true)
    void updateUser(@MappingTarget User user, UpdateProfileRequest request);
}
