import { createRoute, type RootRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { client } from "../lib/rpc";
import { Button } from "../components/ui/button";
import { RefreshCw, ExternalLink, Plus, List } from "lucide-react";
import { toast } from "sonner";

function ProjectsViewComponent() {
  const [orgLogin, setOrgLogin] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data: projectsList, isLoading: projectsLoading, error } = useQuery({
    queryKey: ["githubProjects", orgLogin],
    queryFn: () => client.LIST_GITHUB_PROJECTS({ organizationLogin: orgLogin }),
    enabled: shouldFetch, // Allow fetching even with empty orgLogin
  });

  const { data: projectDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["projectDetails", selectedProjectId],
    queryFn: () => client.GET_PROJECT_DETAILS({ projectId: selectedProjectId! }),
    enabled: !!selectedProjectId,
  });

  const { data: projectItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["projectItems", selectedProjectId],
    queryFn: () => client.LIST_PROJECT_ITEMS({ projectId: selectedProjectId!, first: 10 }),
    enabled: !!selectedProjectId,
  });

  const handleFetchProjects = () => {
    // Allow empty orgLogin - the API will use defaultOrganization
    setShouldFetch(true);
  };

  // Show error if API call fails (using useEffect to avoid multiple toasts)
  useEffect(() => {
    if (error && shouldFetch) {
      const errorMessage = error.message || "Failed to fetch projects";
      if (errorMessage.includes("Organization login is required") || errorMessage.includes("not configured")) {
        toast.error("Please enter an organization name or configure a default organization in your app settings");
      } else {
        toast.error(errorMessage);
      }
      setShouldFetch(false); // Reset to avoid showing error repeatedly
    }
  }, [error, shouldFetch]);

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-4">GitHub Projects V2 Browser</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Browse and explore GitHub Projects V2 from any organization. This demonstrates
        real API calls to GitHub.
      </p>

      {/* Organization Input */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">List Projects</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Organization name (leave empty to use default from settings)"
            value={orgLogin}
            onChange={(e) => {
              setOrgLogin(e.target.value);
              setShouldFetch(false); // Reset fetch flag when typing
            }}
            onKeyDown={(e) => e.key === "Enter" && handleFetchProjects()}
            className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
          <Button onClick={handleFetchProjects} disabled={projectsLoading}>
            {projectsLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <List className="w-4 h-4 mr-2" />
                Fetch Projects
              </>
            )}
          </Button>
        </div>
        {!orgLogin && (
          <p className="text-xs text-gray-500 mt-2">
            💡 Leaving this empty will use your default organization from app settings (if configured)
          </p>
        )}
      </div>

      {/* Projects List */}
      {projectsList && projectsList.projects && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Projects in {orgLogin} ({projectsList.projects.length})
            </h2>
            {projectsList.projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No projects found in this organization.
              </div>
            ) : (
              <div className="space-y-2">
                {projectsList.projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedProjectId === project.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700"
                    }`}
                  >
                    <div className="font-medium">{project.title}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      #{project.number}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project Details */}
          <div>
            {selectedProjectId ? (
              detailsLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
                </div>
              ) : projectDetails ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {projectDetails.project.title}
                    </h3>
                    {projectDetails.project.shortDescription && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {projectDetails.project.shortDescription}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Number</div>
                        <div className="font-medium">
                          #{projectDetails.project.number}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Items</div>
                        <div className="font-medium">
                          {projectDetails.project.itemsCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Status</div>
                        <div className="font-medium">
                          {projectDetails.project.closed ? "Closed" : "Open"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Visibility</div>
                        <div className="font-medium">
                          {projectDetails.project.public ? "Public" : "Private"}
                        </div>
                      </div>
                    </div>
                    <a
                      href={projectDetails.project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center text-blue-500 hover:text-blue-600"
                    >
                      View on GitHub <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>

                  {/* Project Items */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                    <h4 className="font-semibold mb-3">Recent Items</h4>
                    {itemsLoading ? (
                      <div className="text-center py-4">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                      </div>
                    ) : projectItems?.items && projectItems.items.length > 0 ? (
                      <div className="space-y-2">
                        {projectItems.items.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {item.title || "Draft Issue"}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {item.type} {item.number && `#${item.number}`}
                                  {item.state && ` • ${item.state}`}
                                </div>
                              </div>
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-600"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No items in this project
                      </div>
                    )}
                  </div>
                </div>
              ) : null
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a project to view details
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
            Enter a GitHub organization name (like <code className="px-2 py-1 bg-white dark:bg-gray-800 rounded">deco-cx</code>) 
            to see their public projects. This demonstrates real-time API calls to GitHub Projects V2.
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            💡 Tip: If you configured a default organization in your app settings, leave it empty and click "Fetch Projects" to use it.
          </p>
        </div>
      )}
    </div>
  );
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/projects",
    component: ProjectsViewComponent,
    getParentRoute: () => parentRoute,
  });

