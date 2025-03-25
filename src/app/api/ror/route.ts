import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface Organization {
  name: string;
  id: string;
}

interface RORApiResponse {
  items: Organization[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const org = searchParams.get("org");
  if (!org) {
    return NextResponse.json([], { status: 200 });
  }

  const endpoint = `https://api.ror.org/organizations?query=${encodeURIComponent(org)}`;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`ROR API returned status ${response.status}`);
    }

    const data: RORApiResponse = await response.json();

    if (!data.items) {
      throw new Error("Unexpected API response structure");
    }

    const results = data.items.map((org) => ({
      name: org.name,
      ror_id: org.id,
    }));

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("Error fetching organizations from ROR:", error);
    return NextResponse.json([], { status: 200 });
  }
}
