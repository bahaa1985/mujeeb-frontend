import { useState } from "react";
import { supabaseClient } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
interface UseSupaBaseUploadOptions {
    bucketName?: string;
}

export function useSupabaseUpload(options: UseSupaBaseUploadOptions = {}) {
    const { bucketName = 'avatars' } = options
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const user = useAuth().user;
    
    const uploadFile = async (file: File): Promise<string | null> => {
        try {
            setUploading(true);
            setError(null);

            const fileExt = file.name.split('.').pop();
            const fileName = user?.mobile ? user?.mobile + "." + fileExt : Date.now() + "_" + Math.random().toString(36).substring(2, 7)+ "." + fileExt;

            //1- upload to storage bucket
            const { error: uploadError } = await supabaseClient.storage
                .from(bucketName)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });
            if (uploadError) throw uploadError;

            //2- fetch public url 
            const { data } = supabaseClient.storage
                .from(bucketName)
                .getPublicUrl(fileName);
            return data.publicUrl;
        }
        catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            }
            return null;
        } finally {
            setUploading(false);
        }
    }
    return { uploadFile, uploading, error }
}
