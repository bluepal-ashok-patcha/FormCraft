package com.formcraft.service.impl;
 
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.formcraft.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
 
import java.util.Map;
 
@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {
 
    private final Cloudinary cloudinary;
 
    @Override
    public String uploadFile(MultipartFile file) {
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "formcraft/templates",
                    "resource_type", "auto"
            ));
            return (String) uploadResult.get("secure_url");
        } catch (java.io.IOException e) {
            throw new com.formcraft.exception.BusinessLogicException("Visual Protocol Interruption: Asset synchronization with the cloud registry failed.");
        }
    }
}
