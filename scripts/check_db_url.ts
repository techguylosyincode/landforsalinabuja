import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (process.env.DATABASE_URL) {
    console.log('FOUND_DATABASE_URL');
} else if (process.env.POSTGRES_URL) {
    console.log('FOUND_POSTGRES_URL');
} else {
    console.log('NOT_FOUND');
}
