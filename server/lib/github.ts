/**
 * GitHub API client for GraphQL and REST operations.
 * Handles authentication, error handling, and rate limiting.
 */

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    type?: string;
    path?: string[];
  }>;
}

interface GitHubRateLimitError extends Error {
  retryAfter?: number;
}

/**
 * Create a GitHub client with GraphQL and REST capabilities
 */
export function createGitHubClient(token: string) {
  const GITHUB_API_URL = "https://api.github.com";
  const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

  /**
   * Execute a GraphQL query against GitHub's API
   */
  async function graphqlQuery<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "GitHub-Projects-MCP",
      },
      body: JSON.stringify({ query, variables }),
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const error: GitHubRateLimitError = new Error(
        `Rate limit exceeded. Retry after ${retryAfter} seconds.`
      );
      error.retryAfter = retryAfter ? parseInt(retryAfter, 10) : 60;
      throw error;
    }

    if (!response.ok) {
      throw new Error(
        `GitHub API request failed: ${response.status} ${response.statusText}`
      );
    }

    const result: GraphQLResponse<T> = await response.json();

    // Handle GraphQL errors
    if (result.errors && result.errors.length > 0) {
      const errorMessages = result.errors.map((e) => e.message).join(", ");
      throw new Error(`GraphQL errors: ${errorMessages}`);
    }

    if (!result.data) {
      throw new Error("GraphQL response missing data");
    }

    return result.data;
  }

  /**
   * Execute a REST API request against GitHub
   */
  async function restRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${GITHUB_API_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "GitHub-Projects-MCP",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...options.headers,
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const error: GitHubRateLimitError = new Error(
        `Rate limit exceeded. Retry after ${retryAfter} seconds.`
      );
      error.retryAfter = retryAfter ? parseInt(retryAfter, 10) : 60;
      throw error;
    }

    if (!response.ok) {
      let errorMessage = `GitHub REST API request failed: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.json();
        if (errorBody.message) {
          errorMessage += ` - ${errorBody.message}`;
        }
      } catch {
        // Ignore JSON parsing errors for error responses
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  }

  /**
   * Helper to get repository node ID from owner/name
   */
  async function getRepositoryNodeId(
    owner: string,
    repo: string
  ): Promise<string> {
    const query = `
      query GetRepositoryId($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          id
        }
      }
    `;

    const result = await graphqlQuery<{
      repository: { id: string };
    }>(query, { owner, repo });

    return result.repository.id;
  }

  /**
   * Helper to get issue node ID from owner/repo/number
   */
  async function getIssueNodeId(
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<string> {
    const query = `
      query GetIssueId($owner: String!, $repo: String!, $issueNumber: Int!) {
        repository(owner: $owner, name: $repo) {
          issue(number: $issueNumber) {
            id
          }
        }
      }
    `;

    const result = await graphqlQuery<{
      repository: { issue: { id: string } };
    }>(query, { owner, repo, issueNumber });

    return result.repository.issue.id;
  }

  return {
    graphqlQuery,
    restRequest,
    getRepositoryNodeId,
    getIssueNodeId,
  };
}

export type GitHubClient = ReturnType<typeof createGitHubClient>;

