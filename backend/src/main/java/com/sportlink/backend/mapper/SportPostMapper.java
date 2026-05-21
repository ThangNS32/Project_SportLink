package com.sportlink.backend.mapper;

import com.sportlink.backend.dto.response.SportPostResponse;
import com.sportlink.backend.entity.SportPost;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface SportPostMapper {

    @Mapping(target = "userId",         source = "user.userId")
    @Mapping(target = "userFullName",   source = "user.fullName")
    @Mapping(target = "userAvatarUrl",  source = "user.avatarUrl")
    @Mapping(target = "userTrustScore",
            expression = "java(post.getUser().getTrustScore() != null ? post.getUser().getTrustScore().doubleValue() : 5.0)")
    @Mapping(target = "userTotalRating",
            expression = "java(post.getUser().getTotalRating() != null ? post.getUser().getTotalRating() : 0)")
    @Mapping(target = "sportType",  expression = "java(post.getSportType().name())")
    @Mapping(target = "postType",   expression = "java(post.getPostType().name())")
    @Mapping(target = "skillLevel", expression = "java(post.getSkillLevel() != null ? post.getSkillLevel().name() : null)")
    @Mapping(target = "status",     expression = "java(post.getStatus().name())")
    @Mapping(target = "locationLat", expression = "java(post.getLocationLat().doubleValue())")
    @Mapping(target = "locationLng", expression = "java(post.getLocationLng().doubleValue())")
    @Mapping(target = "playFormat", expression = "java(post.getPlayFormat() != null ? post.getPlayFormat().name() : null)")
    @Mapping(target = "distanceKm", ignore = true) // Set thủ công trong service
    SportPostResponse toResponse(SportPost post);
}