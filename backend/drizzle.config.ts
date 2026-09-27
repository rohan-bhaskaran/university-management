import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    out: './drizzle',
    schema: './src/database/schema',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!//dont change cause drizzle cli is standalone and the conig/env.js might not even load
    }
})