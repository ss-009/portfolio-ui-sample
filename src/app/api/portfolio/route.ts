import { NextResponse } from "next/server";
import type { PortfolioApiResponse } from "@/types/api";
// ダミーレスポンスを直接参照する（コピーを作らず単一の情報源にする）。
import portfolioMock from "../../../../docs/dummy_response.json";

export async function GET() {
  const data = portfolioMock as PortfolioApiResponse;
  return NextResponse.json(data);
}
