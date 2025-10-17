import { createRoute, type RootRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { client } from "../lib/rpc";
import { Button } from "../components/ui/button";
import { RefreshCw, ExternalLink, MessageSquare, Tag, User } from "lucide-react";
import { toast } from "sonner";

function IssuesViewComponent() {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);
  const [selectedIssueNumber, setSelectedIssueNumber] = useState<number | null>(null);

  const { data: issuesList, isLoading: issuesLoading, error } = useQuery({
    queryKey: ["githubIssues", owner, repo],
    queryFn: () => client.LIST_ISSUES({ owner, repo, state: "OPEN", first: 20 }),
    enabled: !!owner && !!repo && shouldFetch,
  });

  const { data: issueDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["issueDetails", owner, repo, selectedIssueNumber],
    queryFn: () => client.GET_ISSUE({ owner, repo, issueNumber: selectedIssueNumber! }),
    enabled: !!owner && !!repo && !!selectedIssueNumber,
  });

  const { data: issueComments, isLoading: commentsLoading } = useQuery({
    queryKey: ["issueComments", owner, repo, selectedIssueNumber],
    queryFn: () => client.LIST_ISSUE_COMMENTS({ owner, repo, issueNumber: selectedIssueNumber!, first: 10 }),
    enabled: !!owner && !!repo && !!selectedIssueNumber,
  });

  const handleFetchIssues = () => {
    if (!owner.trim() || !repo.trim()) {
      toast.error("Please enter both owner and repository name");
      return;
    }
    setShouldFetch(true);
  };

  // Show error if API call fails (using useEffect to avoid multiple toasts)
  useEffect(() => {
    if (error && shouldFetch) {
      toast.error(error.message || "Failed to fetch issues");
      setShouldFetch(false); // Reset to avoid showing error repeatedly
    }
  }, [error, shouldFetch]);

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-4">GitHub Issues Browser</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Browse and explore GitHub issues from any repository. This demonstrates real
        API calls to GitHub's Issues API.
      </p>

      {/* Repository Input */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">List Issues</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Owner (e.g., deco-cx)"
            value={owner}
            onChange={(e) => {
              setOwner(e.target.value);
              setShouldFetch(false); // Reset fetch flag when typing
            }}
            className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
          <input
            type="text"
            placeholder="Repository (e.g., deco)"
            value={repo}
            onChange={(e) => {
              setRepo(e.target.value);
              setShouldFetch(false); // Reset fetch flag when typing
            }}
            onKeyDown={(e) => e.key === "Enter" && handleFetchIssues()}
            className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
          <Button onClick={handleFetchIssues} disabled={issuesLoading}>
            {issuesLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Fetch Issues
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Issues List */}
      {issuesList && issuesList.issues && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Open Issues ({issuesList.totalCount})
            </h2>
            {issuesList.issues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No open issues in this repository.
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {issuesList.issues.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => setSelectedIssueNumber(issue.number)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedIssueNumber === issue.number
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700"
                    }`}
                  >
                    <div className="font-medium mb-1">#{issue.number} {issue.title}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {issue.labels.slice(0, 3).map((label) => (
                        <span
                          key={label.name}
                          className="inline-flex items-center px-2 py-1 text-xs rounded"
                          style={{
                            backgroundColor: `#${label.color}20`,
                            color: `#${label.color}`,
                            borderColor: `#${label.color}`,
                            borderWidth: '1px'
                          }}
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {label.name}
                        </span>
                      ))}
                      {issue.labels.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{issue.labels.length - 3} more
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Issue Details */}
          <div>
            {selectedIssueNumber ? (
              detailsLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
                </div>
              ) : issueDetails ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold flex-1">
                        #{issueDetails.issue.number} {issueDetails.issue.title}
                      </h3>
                      <span className={`px-3 py-1 rounded text-sm font-medium ${
                        issueDetails.issue.state === "OPEN"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      }`}>
                        {issueDetails.issue.state}
                      </span>
                    </div>

                    {issueDetails.issue.body && (
                      <div className="prose dark:prose-invert max-w-none mb-4 text-sm">
                        <p className="text-gray-700 dark:text-gray-300 line-clamp-4">
                          {issueDetails.issue.body}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <div>
                        <div className="text-gray-500 mb-1">Author</div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">
                            {issueDetails.issue.author?.login || "Unknown"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Comments</div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <span className="font-medium">
                            {issueDetails.issue.commentsCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {issueDetails.issue.labels.length > 0 && (
                      <div className="mt-4">
                        <div className="text-gray-500 text-sm mb-2">Labels</div>
                        <div className="flex flex-wrap gap-2">
                          {issueDetails.issue.labels.map((label) => (
                            <span
                              key={label.name}
                              className="inline-flex items-center px-2 py-1 text-xs rounded"
                              style={{
                                backgroundColor: `#${label.color}20`,
                                color: `#${label.color}`,
                                borderColor: `#${label.color}`,
                                borderWidth: '1px'
                              }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {issueDetails.issue.assignees.length > 0 && (
                      <div className="mt-4">
                        <div className="text-gray-500 text-sm mb-2">Assignees</div>
                        <div className="flex flex-wrap gap-2">
                          {issueDetails.issue.assignees.map((assignee) => (
                            <span
                              key={assignee.login}
                              className="inline-flex items-center px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-800"
                            >
                              <User className="w-3 h-3 mr-1" />
                              {assignee.login}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <a
                      href={issueDetails.issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center text-blue-500 hover:text-blue-600"
                    >
                      View on GitHub <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>

                  {/* Comments */}
                  {issueDetails.issue.commentsCount > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Recent Comments
                      </h4>
                      {commentsLoading ? (
                        <div className="text-center py-4">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                        </div>
                      ) : issueComments?.comments && issueComments.comments.length > 0 ? (
                        <div className="space-y-3">
                          {issueComments.comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="p-3 rounded border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium">
                                  {comment.author?.login || "Unknown"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                {comment.body}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No comments yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select an issue to view details
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!shouldFetch && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-6">
          <h3 className="font-semibold mb-2">Try it out!</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            Enter a GitHub repository (like <code className="px-2 py-1 bg-white dark:bg-gray-800 rounded">deco-cx/deco</code>) 
            to see its open issues. This demonstrates real-time API calls to GitHub Issues API.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Popular examples: facebook/react, microsoft/vscode, vercel/next.js
          </p>
        </div>
      )}
    </div>
  );
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/issues",
    component: IssuesViewComponent,
    getParentRoute: () => parentRoute,
  });

