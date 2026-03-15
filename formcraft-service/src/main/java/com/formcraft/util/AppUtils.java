package com.formcraft.util;

import java.util.UUID;

public class AppUtils {
    
    public static String generateUniqueId() {
        return UUID.randomUUID().toString();
    }

    // Add other common utilities like date formatting, etc.
}
