import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;

// 개발 모드 HMR에서 연결이 중복 생성되지 않도록 전역에 캐시합니다.
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

/** MONGODB_URI가 설정되어 있는지 여부 */
export const hasDatabase = Boolean(uri);

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("MONGODB_URI 환경 변수가 설정되지 않았습니다.");
  // 연결 불가 시 오래 기다리지 않도록 서버 선택 타임아웃을 짧게 둡니다.
  globalForMongo._mongoClientPromise ??= new MongoClient(uri, {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
  }).connect();
  try {
    const client = await globalForMongo._mongoClientPromise;
    return client.db(process.env.MONGODB_DB ?? "linknamu");
  } catch (error) {
    // 실패한 연결이 캐시에 남아 계속 실패하지 않도록 비웁니다.
    globalForMongo._mongoClientPromise = undefined;
    throw error;
  }
}
