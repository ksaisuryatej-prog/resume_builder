import dotenv from 'dotenv';
import path from 'path';

// Automatically load .env from project root
dotenv.config();

export interface EnvConfig {
  port: number;
  sessionSecret: string;
  mysql: {
    host: string;
    port: number;
    user: string;
    password?: string;
    database: string;
    isConfigured: boolean;
  };
  geminiApiKey: string;
  isGeminiConfigured: boolean;
}

export function validateEnvironment(): EnvConfig {
  const port = Number(process.env.PORT) || 3000;
  const rawSessionSecret = (process.env.SESSION_SECRET || '').trim();
  const rawGeminiKey = (process.env.GEMINI_API_KEY || '').trim();

  const mysqlHost = (process.env.MYSQL_HOST || '').trim();
  const mysqlPort = Number(process.env.MYSQL_PORT) || 3306;
  const mysqlUser = (process.env.MYSQL_USER || '').trim();
  const mysqlPassword = process.env.MYSQL_PASSWORD || '';
  const mysqlDatabase = (process.env.MYSQL_DATABASE || '').trim();

  const isMysqlConfigured = Boolean(mysqlHost && mysqlUser && mysqlDatabase);
  const isGeminiConfigured = Boolean(rawGeminiKey);
  const isSessionConfigured = Boolean(rawSessionSecret);

  console.log('\n======================================================');
  console.log('       ResumeCraft – Environment Configuration');
  console.log('======================================================');

  // Check PORT
  console.log(`✓ PORT: ${port}`);

  // Check SESSION_SECRET
  if (!isSessionConfigured) {
    console.warn('\n⚠️  [Configuration Notice] SESSION_SECRET is empty in .env');
    console.warn('   Action needed: Fill in SESSION_SECRET in .env (e.g. SESSION_SECRET="any-random-string-12345")');
    console.warn('   Using temporary development session secret for now.');
  } else {
    console.log('✓ SESSION_SECRET: [CONFIGURED]');
  }

  // Check MYSQL
  if (!isMysqlConfigured) {
    console.log('\nℹ️  [Database Configuration] MySQL variables are empty in .env:');
    if (!mysqlHost) console.log('   - MYSQL_HOST needs to be filled (e.g. localhost)');
    if (!mysqlUser) console.log('   - MYSQL_USER needs to be filled (e.g. root)');
    if (!mysqlDatabase) console.log('   - MYSQL_DATABASE needs to be filled (e.g. resumecraft_db)');
    console.log('   → Operating with zero-config persistent relational database in data/resumecraft_store.json.');
    console.log('   → To use local MySQL, simply fill in the values in .env. No code changes required!');
  } else {
    console.log(`✓ MYSQL DATABASE: Configured to connect to ${mysqlUser}@${mysqlHost}:${mysqlPort}/${mysqlDatabase}`);
  }

  // Check GEMINI_API_KEY
  if (!isGeminiConfigured) {
    console.warn('\n⚠️  [AI Configuration Notice] GEMINI_API_KEY is empty in .env');
    console.warn('   Action needed: Fill in GEMINI_API_KEY in .env to enable AI resume polish and career suggestions.');
    console.warn('   Get your free API key at: https://aistudio.google.com/');
    console.warn('   (All templates, resume builder, and career matching continue working with built-in fallbacks.)');
  } else {
    console.log('✓ GEMINI_API_KEY: [CONFIGURED]');
  }

  console.log('======================================================\n');

  return {
    port,
    sessionSecret: rawSessionSecret || 'resumecraft-fallback-secret-2026',
    mysql: {
      host: mysqlHost,
      port: mysqlPort,
      user: mysqlUser,
      password: mysqlPassword,
      database: mysqlDatabase,
      isConfigured: isMysqlConfigured
    },
    geminiApiKey: rawGeminiKey,
    isGeminiConfigured
  };
}

export const envConfig = validateEnvironment();
