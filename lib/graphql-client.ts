import { GraphQLClient } from "graphql-request"

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "https://presocial-hilton-despisingly.ngrok-free.dev/graphql"

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    "Content-Type": "application/json",
  },
})

export async function fetchGraphQL<T>(query: string, variables?: Record<string, any>): Promise<T> {
  try {
    const response = await graphqlClient.request<T>(query, variables)
    console.log("[v0] GraphQL Response:", response)
    return response;
  } catch (error) {
    console.error("[v0] GraphQL Error:", error)
    throw error
  }
}
