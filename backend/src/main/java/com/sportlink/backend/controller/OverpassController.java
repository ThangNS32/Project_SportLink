package com.sportlink.backend.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/overpass")
public class OverpassController {

    private static final String OVERPASS_URL = "https://overpass-api.de/api/interpreter";
    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/nearby")
    public ResponseEntity<String> nearby(
            @RequestParam double lat,
            @RequestParam double lng) {

        String query = String.format(
                "[out:json][timeout:10];\n(\n" +
                        "  node[\"sport\"=\"football\"](around:10000,%f,%f);\n" +
                        "  way[\"sport\"=\"football\"](around:10000,%f,%f);\n" +
                        "  node[\"sport\"=\"soccer\"](around:10000,%f,%f);\n" +
                        "  way[\"sport\"=\"soccer\"](around:10000,%f,%f);\n" +
                        "  node[\"sport\"=\"badminton\"](around:10000,%f,%f);\n" +
                        "  way[\"sport\"=\"badminton\"](around:10000,%f,%f);\n" +
                        "  node[\"sport\"=\"pickleball\"](around:10000,%f,%f);\n" +
                        "  way[\"sport\"=\"pickleball\"](around:10000,%f,%f);\n" +
                        "  node[\"leisure\"=\"sports_centre\"](around:10000,%f,%f);\n" +
                        "  way[\"leisure\"=\"sports_centre\"](around:10000,%f,%f);\n" +
                        "  node[\"leisure\"=\"pitch\"](around:10000,%f,%f);\n" +
                        "  way[\"leisure\"=\"pitch\"](around:10000,%f,%f);\n" +
                        ");\nout center;",
                lat,lng, lat,lng, lat,lng, lat,lng, lat,lng, lat,lng,
                lat,lng, lat,lng, lat,lng, lat,lng, lat,lng, lat,lng
        );

        return postToOverpass(query);
    }

    @GetMapping("/search")
    public ResponseEntity<String> search(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam String q) {

        String escaped = q.replaceAll("[.+*?^${}()|\\[\\]\\\\]", "\\\\$0");
        String query = String.format(
                "[out:json][timeout:10];\n(\n" +
                        "  node[\"name\"~\"%s\",i][\"sport\"](around:10000,%f,%f);\n" +
                        "  way[\"name\"~\"%s\",i][\"sport\"](around:10000,%f,%f);\n" +
                        "  node[\"name\"~\"%s\",i][\"leisure\"~\"sports_centre|pitch\"](around:10000,%f,%f);\n" +
                        "  way[\"name\"~\"%s\",i][\"leisure\"~\"sports_centre|pitch\"](around:10000,%f,%f);\n" +
                        ");\nout center;",
                escaped, lat, lng,
                escaped, lat, lng,
                escaped, lat, lng,
                escaped, lat, lng
        );

        return postToOverpass(query);
    }

    private ResponseEntity<String> postToOverpass(String query) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        HttpEntity<String> request = new HttpEntity<>(query, headers);
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    OVERPASS_URL, request, String.class);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("{\"elements\":[]}");
        }
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("OK");
    }
}