import { NextResponse } from "next/server";

export async function GET(req, res) {
    const { searchParams } = new URL(req.url);
    const org=  searchParams.get('org')
    console.log("organization",org)
    const endpoint = `https://api.ror.org/organizations?query=${encodeURIComponent(org)}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`ROR API returned status ${response.status}`);
    }

    const data = await response.json();

    if (!data.items) {
      throw new Error("Unexpected API response structure");
    }

    const results = data.items.map(org => ({
      name: org.name,
      ror_id: org.id
    }));
    return NextResponse.json(results, {status: 200});

  } catch (error) {
    console.error("Error fetching organizations from ROR:", error);
    return NextResponse.json([], {status: 200});
  }
}