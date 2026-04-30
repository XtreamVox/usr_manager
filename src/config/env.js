import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
    DB_URI: z.string().optional(),
    DATABASE_URL: z.string().optional(),
    JWT_SECRET: z.string().min(10, 'JWT_SECRET debe tener al menos 32 caracteres'),
    /*SLACK_WEBHOOK= z.string(),
    CLOUDINARY_CLOUD_NAME= z.string(),
    CLOUDINARY_API_KEY= z.string(),
    CLOUDINARY_API_SECRET= z.string(),
    EMAIL_USER: z.email(),
    EMAIL_PASS: z.string().min(8, 'EMAIL_PASS debe tener al menos 8 caracteres')*/
}).refine((env) => env.DB_URI || env.DATABASE_URL, {
    message: 'DB_URI o DATABASE_URL es obligatoria',
    path: ['DB_URI']
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Variables de entorno inválidas:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

const env = {
    ...parsed.data,
    DB_URI: parsed.data.DB_URI ?? parsed.data.DATABASE_URL
};

export default env;
